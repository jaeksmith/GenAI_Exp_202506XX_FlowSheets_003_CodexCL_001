// Canvas view for templates and worksheets
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type'); // 'template' or 'worksheet'
  const name = params.get('name');
  const canvas = document.getElementById('canvas');
  let sheet = null;
  let mode = 'FLOW';
  let pendingConnectionSource = null;
  let pendingConnectionMouse = null;
  // Always intercept blank-canvas right-click for mode switching / node actions
  canvas.addEventListener('contextmenu', onCanvasContextMenu);
  // Debug: log clicks and mousedowns on canvas
  canvas.addEventListener('mousedown', e => {
    console.log('Canvas mousedown:', 'target=', e.target, 'pendingConnectionSource=', pendingConnectionSource);
  });
  // Cancel an in-progress node-to-node connection on clicking blank canvas
  canvas.addEventListener('click', e => {
    console.log('Canvas click:', 'offset=', e.offsetX, e.offsetY,
                'client=', e.clientX, e.clientY,
                'pendingConnectionSource=', pendingConnectionSource);
    if (pendingConnectionSource && !e.target.closest('.node')) {
      pendingConnectionSource = null;
      pendingConnectionMouse = null;
      document.getElementById('status').textContent = '';
    }
  });
  // Track mouse for drawing the pending connection line (relative to canvas)
  canvas.addEventListener('mousemove', e => {
    console.log('Canvas mousemove:', 'offset=', e.offsetX, e.offsetY,
                'client=', e.clientX, e.clientY,
                'pendingConnectionSource=', pendingConnectionSource);
    if (pendingConnectionSource) {
      const rect = canvas.getBoundingClientRect();
      pendingConnectionMouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      renderCanvas();
    }
  });

  function loadSheet() {
    fetch(`/api/v1/${type}s/${encodeURIComponent(name)}`)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        sheet = data.nodes ? data : { nodes: [], connections: [], mode: 'FLOW' };
        mode = sheet.mode || 'FLOW';
        initModeToggle();
        renderCanvas();
      })
      .catch(err => alert('Error loading ' + type + ': ' + err));
  }

  function initModeToggle() {
    const div = document.getElementById('modeToggle');
    div.innerHTML = '';
    ['FLOW', 'EDIT', 'VIEW'].forEach(m => {
      const btn = document.createElement('button');
      btn.textContent = m;
      btn.disabled = (m === mode);
      btn.addEventListener('click', () => {
        mode = m;
        sheet.mode = mode;
        updateModeButtons();
        renderCanvas();
      });
      div.appendChild(btn);
    });
  }

  function updateModeButtons() {
    Array.from(document.getElementById('modeToggle').children)
      .forEach(btn => btn.disabled = (btn.textContent === mode));
  }

  function renderCanvas() {
    canvas.innerHTML = '';
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', canvas.clientWidth);
    svg.setAttribute('height', canvas.clientHeight);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    // Allow clicks through SVG overlay so nodes beneath remain interactive
    svg.style.pointerEvents = 'none';
    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '5');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
    path.setAttribute('fill', '#000');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);
    // Render nodes below connection lines
    sheet.nodes.forEach(node => renderNode(node));
    // Draw connections (lines + arrowheads) on top of nodes
    sheet.connections.forEach(conn => {
      const fromNode = sheet.nodes.find(n => n.id === conn.from);
      const toNode = sheet.nodes.find(n => n.id === conn.to);
      if (fromNode && toNode) {
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', fromNode.x + 60);
        line.setAttribute('y1', fromNode.y + 20);
        line.setAttribute('x2', toNode.x + 60);
        line.setAttribute('y2', toNode.y + 20);
        line.setAttribute('stroke', '#000');
        line.setAttribute('marker-end', 'url(#arrow)');
        svg.appendChild(line);
      }
    });
    // Draw pending connection (drag line) if active
    if (pendingConnectionSource && pendingConnectionMouse) {
      const fromNode = sheet.nodes.find(n => n.id === pendingConnectionSource);
      if (fromNode) {
        const dragLine = document.createElementNS(svgNS, 'line');
        dragLine.setAttribute('x1', fromNode.x + 60);
        dragLine.setAttribute('y1', fromNode.y + 20);
        dragLine.setAttribute('x2', pendingConnectionMouse.x);
        dragLine.setAttribute('y2', pendingConnectionMouse.y);
        dragLine.setAttribute('stroke', '#f00');
        dragLine.setAttribute('stroke-dasharray', '5,5');
        dragLine.setAttribute('marker-end', 'url(#arrow)');
        svg.appendChild(dragLine);
      }
    }
    canvas.appendChild(svg);
  }

  function renderNode(node) {
    const el = document.createElement('div');
    el.className = 'node ' + node.state;
    el.style.left = node.x + 'px';
    el.style.top = node.y + 'px';
    el.innerHTML = `<div class="label">${node.label}</div>`;
    node.tasks.forEach((t, i) => {
      const tdiv = document.createElement('div');
      tdiv.className = 'task';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = !!t.complete;
      if (mode === 'FLOW') {
        chk.disabled = false;
        chk.addEventListener('change', () => { t.complete = chk.checked; saveSheet(); });
      } else {
        chk.disabled = true;
      }
      tdiv.appendChild(chk);
      tdiv.appendChild(document.createTextNode(t.label));
      el.appendChild(tdiv);
    });
    if (mode === 'EDIT') {
      // Node context menu and drag/connection behavior in EDIT mode
      el.addEventListener('contextmenu', e => {
        e.preventDefault();
        const items = [];
        if (!pendingConnectionSource) {
          items.push({
            label: 'Connect From Here',
            action: () => {
              console.log('ConnectFromHere action: setting pendingConnectionSource =', node.id);
              pendingConnectionSource = node.id;
              document.getElementById('status').textContent = 'Click target node to connect';
            }
          });
        } else {
          items.push({
            label: 'Cancel Connection',
            action: () => {
              console.log('CancelConnection action: clearing pendingConnectionSource');
              pendingConnectionSource = null;
              document.getElementById('status').textContent = '';
            }
          });
        }
        items.push({ label: 'Delete Node', action: () => deleteNode(node) });
        createContextMenu(items, e.pageX, e.pageY);
      });
      makeDraggable(el, node);
    }
    canvas.appendChild(el);
  }

  function onCanvasContextMenu(e) {
    // Blank-canvas right-click: mode switch menu (plus Add Node in EDIT)
    // Ignore contextmenu on nodes or existing menus (let node handlers fire)
    if (e.target.closest('.node') || e.target.closest('.context-menu')) return;
    e.preventDefault();
    const items = [];
    ['FLOW', 'EDIT', 'VIEW'].forEach(m => {
      items.push({
        label: m + ' Mode',
        action: () => { mode = m; sheet.mode = mode; updateModeButtons(); renderCanvas(); },
        disabled: (m === mode)
      });
    });
    if (mode === 'EDIT') {
      items.push({ label: 'Add Node', action: () => addNodeAt(e.offsetX, e.offsetY) });
    }
    createContextMenu(items, e.pageX, e.pageY);
  }

  function addNodeAt(x, y) {
    const label = prompt('Node label:');
    if (!label) return;
    const id = 'n' + Date.now();
    sheet.nodes.push({ id, x, y, state: 'FUTURE', label, tasks: [] });
    saveSheet();
    renderCanvas();
  }

  function deleteNode(node) {
    sheet.nodes = sheet.nodes.filter(n => n.id !== node.id);
    saveSheet();
    renderCanvas();
  }

  function makeDraggable(el, node) {
    let startX, startY, origX, origY;
    el.addEventListener('mousedown', e => {
      if (mode !== 'EDIT') return;
      // If we have a pending connection, complete it on mousedown and skip drag
      if (pendingConnectionSource) {
        const src = pendingConnectionSource;
        pendingConnectionSource = null;
        document.getElementById('status').textContent = '';
        if (src !== node.id) {
          sheet.connections.push({ from: src, to: node.id });
          saveSheet();
        }
        renderCanvas();
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      console.log('Drag start on node:', node.id, 'client=', e.clientX, e.clientY);
      startX = e.clientX;
      startY = e.clientY;
      origX = node.x;
      origY = node.y;
      const onMouseMove = me => {
        node.x = origX + (me.clientX - startX);
        node.y = origY + (me.clientY - startY);
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
        console.log('Dragging node:', node.id, 'to', node.x, node.y);
      };
      const onMouseUp = () => {
        console.log('Drag end on node:', node.id);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        saveSheet();
        renderCanvas();
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  function saveSheet() {
    sheet.mode = mode;
    const status = document.getElementById('status');
    status.textContent = 'Saving...';
    fetch(`/api/v1/${type}s/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheet)
    }).then(res => {
      if (!res.ok) return res.text().then(t => Promise.reject(t));
      status.textContent = 'Saved';
      setTimeout(() => status.textContent = '', 1500);
    }).catch(err => {
      alert('Error saving: ' + err);
      status.textContent = 'Error';
    });
  }

  function createContextMenu(items, x, y) {
    removeContextMenu();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    const ul = document.createElement('ul');
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.label;
      li.addEventListener('click', () => { item.action(); removeContextMenu(); });
      ul.appendChild(li);
    });
    menu.appendChild(ul);
    document.body.appendChild(menu);
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }

  function removeContextMenu() {
    const existing = document.querySelector('.context-menu');
    if (existing) existing.remove();
  }

  document.body.addEventListener('click', removeContextMenu);

  // Bind save button
  document.getElementById('saveBtn').addEventListener('click', saveSheet);

  // Initial load
  loadSheet();
});