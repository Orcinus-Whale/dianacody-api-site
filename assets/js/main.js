document.addEventListener('DOMContentLoaded', async() => {
  
  // [减少重复http请求] 增加本地缓存=浏览器内存,防止全文检索时,每输入字符就http请求，key=md文件路径，value=md原始文本
  const mdCache = new Map();   //存完整md全文,用于页面跳转渲染-正文展示；key=文档路径,value=完整原始md全文文本；
  const MAX_CACHE_COUNT = 30;  //最多缓存30份md
  let searchIndex = [];        //预构建‘轻量搜索索引’,只存‘标题+简短片段’,专供搜索使用(页面初始化加载时,预加载)

  // (开发模式) 缓存禁用开关:false=开启缓存,true=关闭缓存调试
  const devMode = false;
  // 工具函数：fetch md文件（增加内存缓存）
  async function fetchMD(path) {
    //若内存已有,直接返回缓存,不请求网络
    if(!devMode && mdCache.has(path)) {
      // md数量多+文件大,防止大量内存占用,LRU限制:读取时把该项挪到最后，表示最近使用
      const val = mdCache.get(path);
      mdCache.delete(path);
      mdCache.set(path, val);
      return val;
    }
    //若内存没有,则发起http请求网络
    const res = await fetch('./docs/' + path);
    const text = await res.text();
    // LRU:超过内存上限,删除最久未用的（Map迭代顺序是插入顺序）
    if(mdCache.size >= MAX_CACHE_COUNT) {
      const oldestKey = mdCache.keys().next().value;
      mdCache.delete(oldestKey);
    }
    //存入内存缓存
    if(!devMode) {
      mdCache.set(path, text);
    }
    return text;
  }

  /**
   * 索引预加载 (防止普遍关键字检索大量‘全文’文档,阻塞CPU)
   * 构建轻量搜索索引：读取md，只保存标题+前N字符片段，舍弃全文
   * @param {string[]} docPathList _sidebar解析出来的md路径数组
   */
  async function buildSearchIndex(docPathList) {
    const idx = [];
    for(const path of docPathList) {
      try {
        const fullText = await fetchMD(path);
        const title = fullText.split('\n')[0].replace('# ','').trim();
        // 截取搜索片段=文档前800字符，无需检索整篇大文档
        const snippet = fullText.substring(0,800).toLowerCase();
        idx.push({
          path,
          title,
          snippet
        });
      }
      catch(e) {
        console.warn('构建索引失败',path,e);
      }
    }
    searchIndex = idx;
  }

  // 1.动态年份
  document.getElementById('year').textContent = new Date().getFullYear();

  // 2.主题切换
  const themeBtn = document.getElementById('themeToggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeBtn.textContent = '日间';
  }
  themeBtn.onclick = () => {
    document.body.classList.toggle('dark');
    const dark = document.body.classList.contains('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    themeBtn.textContent = dark ? '日间' : '夜间';
  };

  // 3.加载侧边栏
  const sidebarNav = document.getElementById('sidebarNav');
  const sidebarMD = await fetchMD('_sidebar.md');
  /* ------- (1) 目录菜单栏文字:层级&收折 ------- */
  // 解析_sidebar.md无序列表，按markdown缩进构建‘目录栏-树节点’
  function parseSidebarMd(text) {
    const lines = text.split('\n');
    const root = { children:[] };
    const stack = [root];
    for(const line of lines) {
      const match = line.match(/^(\s*)-\s+(.*)$/);
      if(!match) continue;
      const indentStr = match[1];
      const content = match[2];
      const level = Math.floor(indentStr.length / 2);
      // 回退栈到对应层级
      while(stack.length-1 > level) stack.pop();
      const parent = stack[stack.length-1];
      // 解析 [title](path.md)
      const linkMatch = content.match(/^\[(.*?)\]\((?!http)(.*?\.md)\)/);
      let node;
      if(linkMatch) {
        node = {
          title: linkMatch[1].trim(),
          href: linkMatch[2].trim(),
          children: []
        };
      }
      else {
        // 分组标题（无链接，仅目录分组）
        node = {
          title: content.trim(),
          href: null,
          children: []
        };
      }
      parent.children.push(node);
      stack.push(node);
    }
    return root.children;
  }

  // 递归渲染树DOM，默认全部折叠
  function renderSidebarTree(nodes, container) {
    const ul = document.createElement('ul');
    for(const n of nodes) {
      const li = document.createElement('li');
      const itemWrap = document.createElement('div');
      itemWrap.className = 'sidebar-item-wrap';
      // 箭头，仅存在子节点才显示
      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'sidebar-arrow';
      if(n.children.length > 0) {
        //箭头svg符号
        arrowSpan.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"></path></svg>`;
      }
      // 链接/纯文本标题
      let titleEl;
      if(n.href) {
        titleEl = document.createElement('a');
        titleEl.className = 'sidebar-link';
        titleEl.textContent = n.title;
        titleEl.setAttribute('href', n.href);
      }
      else {
        titleEl = document.createElement('span');
        titleEl.className = 'sidebar-group-title';
        titleEl.textContent = n.title;
      }
      itemWrap.appendChild(arrowSpan);
      itemWrap.appendChild(titleEl);
      li.appendChild(itemWrap);
      // 递归子列表，默认折叠（加collapsed）
      if(n.children.length > 0) {
        const childUl = document.createElement('ul');
        childUl.className = 'sidebar-children collapsed';
        renderSidebarTree(n.children, childUl);
        li.appendChild(childUl);
        // 点击wrap切换折叠，箭头旋转
        itemWrap.addEventListener('click', (e) => {
          // 如果点击a链接，交给原有a点击事件，不做折叠
          if(e.target.tagName === 'A') return;
          e.stopPropagation();
          childUl.classList.toggle('collapsed');
          arrowSpan.classList.toggle('rot');
        })
      }
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }
  const sidebarTree = parseSidebarMd(sidebarMD);
  sidebarNav.innerHTML = '';
  renderSidebarTree(sidebarTree, sidebarNav);

  /* ------- (2) 调用‘索引预加载’ ------- */
  // 从_sidebar.md自动提取全部md路径，用于全文搜索
  const autoDocList = extractMdLinks(sidebarMD);  //extractMdLinks():正则抓取所有md路径
  // (后台)索引预加载：页面空闲时构建搜索轻量索引；不阻塞首屏渲染
  // setTimeout(100)：等首屏页面渲染完成之后，后台空闲再跑索引，不拖慢页面打开速度。
  setTimeout(async() => {
    await buildSearchIndex(autoDocList);
  },100);

  // 侧边栏链接点击：加载对应md
  sidebarNav.addEventListener('click', async(e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      // getAttribute拿到原始字符串，不要用e.target.href,会被浏览器自动转成绝对url; (修复反复点击-文件夹相对路径,叠加URL)
      const rawPath = e.target.getAttribute('href');
      await loadPage(rawPath);
      // 高亮当前选中
      sidebarNav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      e.target.classList.add('active');
      // hash路由，不会产生路径叠加，刷新不会404
      history.pushState(null, '', '#'+rawPath);
    }
  });

  // 4.加载md页面 + 生成右侧TOC
  const markdownBody = document.getElementById('markdownBody');
  const tocList = document.getElementById('tocList');

  async function loadPage(path) {
    const md = await fetchMD(path);  //fetchMD():加载全文,阅读区展示,存放md里不是results里，后文results -> searchResultList
    const html = marked.parse(md);
    markdownBody.innerHTML = html;
    
    /* ===== 代码高亮/语言标签/行号 ===== */
    hljs.highlightAll();  //代码高亮
    //顶上语言标签
    const preBlocks = markdownBody.querySelectorAll('pre');
    preBlocks.forEach(pre => {
      const code = pre.querySelector('code');
      if(!code) {
        return;
      }
      // 获取语言类型(eg.bash/python/java/c)
      const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
      let langName = '';
      if(langClass) {
        langName = langClass.replace('language-','');
      }
      // 插入顶部语言标签
      if(langName) {
        const langBar = document.createElement('div');
        langBar.className = 'code-lang-label';
        langBar.textContent = langName;
        pre.prepend(langBar);
      }
      // 开启行号
      //code.classList.add('hljs-line-numbers');  //--行号无法加载
      // 不要加class，直接调用插件API渲染行号
      if (typeof hljs.lineNumbersBlock === "function") {
        hljs.lineNumbersBlock(code);
      }
    });

    // 生成右侧TOC：提取所有h2/h3
    const headings = markdownBody.querySelectorAll('h2, h3');
    let tocHtml = '';
    headings.forEach(h => {
      const id = h.textContent.replace(/\s+/g, '-').toLowerCase();
      h.id = id;
      tocHtml += `<a href="#${id}">${h.textContent}</a>`;
    });
    tocList.innerHTML = tocHtml;
    window.scrollTo(0, 0);
  }

  // 页面初始化读取hash，打开对应文档（解决Ctrl+R刷新，保留当前url:port/xx.md页面）
  // 默认加载快速开始：读取url-hash,#后面为md路径
  let initPath = 'quickstart.md'; 
  const hash = window.location.hash.replace('#','');
  if(hash) {
    initPath = hash;
  }
  await loadPage(initPath);
  // 设置侧边栏active
  const activeLink = sidebarNav.querySelector(`a[href="${initPath}"]`);
  if(activeLink){
    sidebarNav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    activeLink.classList.add('active');
  }

  // 右侧TOC点击跳转
  tocList.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'A') {
      const id = e.target.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      el.scrollIntoView({behavior: 'smooth'});
    }
  });

  // 5.全文检索：遍历所有md文件做关键词匹配
  // 方法1:不要硬编码文件路径
  //const allDocs = ['quickstart.md', 'auth.md', 'api/chat.md', 'api/embedding.md', 'error.md'];
  // 方法2:解析_sidebar.md文本,提取所有.md相对路径
  function extractMdLinks(sidebarMarkdownText) {
    const links = [];
    // 匹配markdown[文字](path.md)，不捕获http外部链接
    const linkRegex = /\[.*?\]\((?!http)(.*?\.md)\)/g;
    let match;
    while ((match = linkRegex.exec(sidebarMarkdownText)) !== null) {
      const path = match[1].trim();
      if (!links.includes(path)) {
        links.push(path);
      }
    }
    return links;
  }
  
  //鼠标
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  //键盘上下
  let searchResultList = [];
  let searchSelectedIndex = -1;
  //鼠标点击
  searchInput.addEventListener('input', async() => {
    const kw = searchInput.value.trim().toLowerCase();
    if(!kw) {
      searchResults.classList.remove('show');
      searchResultList = [];
      searchSelectedIndex = -1;
      return;
    }
    // 索引还预加载完毕(页面初始化<100ms内),用户就开始搜索,‘搜索提示’弹出文字
    if(searchIndex.length === 0){
      searchResults.innerHTML = `<div style="padding:10px 16px;color:var(--text2)">正在构建搜索索引，请稍候...</div>`;
      searchResults.classList.add('show');
      return;
    }

    const results = [];
    /**
    // 方法1:(全篇检索) 使用从_sidebar.md自动抓取的文档列表, 不要硬编码解析allDocs列表:for(const doc of allDocs)
    for(const doc of autoDocList) {
      //try‑catch：防止`_sidebar.md`写错链接，某个md404导致整个搜索直接挂掉。
      try {
        const content = await fetchMD(doc);
        if(content.toLowerCase().includes(kw)) {
          // 取文档第一行#作为标题
          const title = content.split('\n')[0].replace('# ', '').trim();
          results.push({title, doc});
        }
      }
      catch(err) {
        // 某个md读取404，跳过，不打断整个搜索
        console.warn('搜索跳过无法加载文档:', doc, err);
      }
    }
    */
    // 方法2:(检索片段快照) 在标题or文档片段内,匹配关键字 (不直接检索全篇文档)
    for(const item of searchIndex) {
      if(item.title.toLowerCase().includes(kw) || item.snippet.includes(kw)) {
        results.push({
          title: item.title,
          doc: item.path  // 仅仅传递路径字符串! 不携带任何md文本!
        });
      }
    }
    //_sidebar.md配置解析的文件列表读取
    searchResultList = results;
    searchSelectedIndex = -1;
    searchResults.innerHTML = results.map((r,i) => `<a href="${r.doc}" data-idx="${i}">${r.title}</a>`).join('');
    searchResults.classList.add('show');

    //鼠标匹配
    searchResults.innerHTML = results.map(r => `<a href="${r.doc}">${r.title}</a>`).join('');
    searchResults.classList.add('show');
    //键盘上下匹配
    searchResultList = results;
    searchSelectedIndex = -1;
    searchResults.innerHTML = results.map((r,i) => `<a href="${r.doc}" data-idx="${i}">${r.title}</a>`).join('');
    searchResults.classList.add('show');
  });
  // 搜索结果点击
  searchResults.addEventListener('click', async(e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      await loadPage(href);
      history.pushState(null, '', '#'+href);
      searchResults.classList.remove('show');
      searchInput.value = '';
    }
  });
  // 键盘上下/回车/ESC
  searchInput.addEventListener('keydown', async(e) => {
  if(!searchResults.classList.contains('show') || searchResultList.length === 0 ) return;
  switch(e.key) {
    case 'ArrowDown':
      e.preventDefault();
      searchSelectedIndex = Math.min(searchSelectedIndex+1, searchResultList.length-1);
      updateSearchHighlight();
      break;
    case 'ArrowUp':
      e.preventDefault();
      searchSelectedIndex = Math.max(searchSelectedIndex-1, 0);
      updateSearchHighlight();
      break;
    case 'Enter':
      e.preventDefault();
      if(searchSelectedIndex >= 0) {
        const item = searchResultList[searchSelectedIndex];
        await loadPage(item.doc);
        searchResults.classList.remove('show');
        searchInput.value = '';
        searchResultList = [];
        searchSelectedIndex = -1;
      }
      break;
    case 'Escape':
      e.preventDefault();
      searchResults.classList.remove('show');
      searchResultList = [];
      searchSelectedIndex = -1;
      break;
    }
  });
  // 更新搜索结果高亮
  function updateSearchHighlight() {
    const links = searchResults.querySelectorAll('a');
    links.forEach((link, i) => {
      if(i === searchSelectedIndex) {
        link.classList.add('search-active');
        link.scrollIntoView({block:'nearest'});
      }
      else {
        link.classList.remove('search-active');
      }
    })
  }
  // 点击页面其他地方关闭搜索结果
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('show');
    }
  });

  // 6.侧边栏(目录菜单栏面板)收折
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');
  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('full-width');
  });

  // 7.回到顶部
  const backTop = document.getElementById('backTop');
  window.onscroll = () => {
    backTop.style.opacity = window.scrollY > 300 ? 1 : 0.6;
  };
  backTop.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});

  // 8. 反馈弹窗
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackPopover = document.getElementById('feedbackPopover');
  const submitFeedback = document.getElementById('submitFeedback');
  const feedbackName = document.getElementById('feedbackName');
  const feedbackMsg = document.getElementById('feedbackMsg');
  const errorTips = feedbackPopover.querySelectorAll('.form-error');

  feedbackBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    // 固定弹窗在浏览器右下角
    const isShow = feedbackPopover.classList.contains('show');
    if(!isShow){
        // 获取反馈按钮屏幕位置
        const rect = feedbackBtn.getBoundingClientRect();
        // 弹窗：右侧对齐按钮的右边缘；弹窗底边距离按钮上边 =12px（和按钮之间gap一致）
        feedbackPopover.style.right = `${window.innerWidth - rect.right}px`;
        feedbackPopover.style.bottom = `${window.innerHeight - rect.top + 12}px`;
    }
    feedbackPopover.classList.toggle('show');
  });

  // 点击页面其他区域关闭浮层
  document.addEventListener('click', function(e) {
    if (!feedbackPopover.contains(e.target) && e.target !== feedbackBtn) {
      feedbackPopover.classList.remove('show');
    }
  });

  // 表单校验：输入时隐藏错误提示
  [feedbackName, feedbackMsg].forEach(input => {
    input.addEventListener('input', function() {
      const errTip = this.parentElement.querySelector('.form-error');
      errTip.style.display = 'none';
      errTip.textContent = '请填写此字段❗'; // 重置提示文本
      this.style.borderColor = '';
    });
  });

  // 提交反馈
  submitFeedback.addEventListener('click', function() {
    let valid = true;
    const nameVal = feedbackName.value.trim();
    const msgVal = feedbackMsg.value.trim();

    // 非空校验
    if (!nameVal) {
      feedbackName.parentElement.querySelector('.form-error').style.display = 'block';
      feedbackName.style.borderColor = '#ef4444';
      valid = false;
    }
    if (!msgVal) {
      feedbackMsg.parentElement.querySelector('.form-error').style.display = 'block';
      feedbackMsg.style.borderColor = '#ef4444';
      valid = false;
    }
    // 长度校验
    if(nameVal.length > 64) {
      feedbackName.parentElement.querySelector('.form-error').textContent = '昵称不能超过64个字符❗';
      feedbackName.parentElement.querySelector('.form-error').style.display = 'block';
      feedbackName.style.borderColor = '#ef4444';
      valid = false;
    }
    if(msgVal.length > 800) {
      feedbackMsg.parentElement.querySelector('.form-error').textContent = '反馈内容不能超过800个字符❗';
      feedbackMsg.parentElement.querySelector('.form-error').style.display = 'block';
      feedbackMsg.style.borderColor = '#ef4444';
    }

    if (!valid) return;

    // 校验通过
    submitFeedback.textContent = '✓ 演示提交（未配置后端）';  //按钮状态保持蓝色,不自动关闭浮层
    submitFeedback.disabled = true;                        //禁用按钮,防恶意刷点击,保留用户输入内容不清空
    // 5s后自动重置对话框,可再次编辑提交
    setTimeout(() => {
      submitFeedback.textContent = '提交反馈';
      submitFeedback.disabled = false;
      // feedbackName.value = ''; //清空姓名栏
      // feedbackMsg.value = '';  //清空反馈栏
    }, 5000);
    /**
     * 防恶意刷点击：后端限流(IP/浏览器session会话:提交max=2-3次/min),前端仅辅助。
     * ·后端: 长度+限流+参数绑定防注入;
     *    >同一个session/IP，'反馈次数<3次/min'，返回429拒绝
     * ·前端: 拿到429返回时提示：`❗提交过于频繁,请稍后再试`；
     */
  });

  // 浏览器前进&后退按钮popstate事件，支持浏览器回退'刷新页面'
  // 监听浏览器前进后退
  window.addEventListener('popstate', async() => {
    const hash = window.location.hash.replace('#','');
    if(!hash) return;
    await loadPage(hash);
    const link = sidebarNav.querySelector(`a[href="${hash}"]`);
    if(link){
      sidebarNav.querySelectorAll('a').forEach(a=>a.classList.remove('active'));
      link.classList.add('active');
    }
  })

});


