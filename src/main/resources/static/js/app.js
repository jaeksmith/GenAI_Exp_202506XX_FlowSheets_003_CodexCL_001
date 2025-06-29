// FlowSheets application entry point
document.addEventListener('DOMContentLoaded', () => {
  console.log('FlowSheets app initialized');
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="list-container">
      <h2>Templates</h2>
      <input type="text" id="templatesSearch" class="search-box" placeholder="Search templates">
      <ul id="templatesList"><li>Loading...</li></ul>
    </div>
    <div class="list-container">
      <h2>Worksheets</h2>
      <input type="text" id="worksheetsSearch" class="search-box" placeholder="Search worksheets">
      <ul id="worksheetsList"><li>Loading...</li></ul>
    </div>
  `;

  let templates = [];
  let worksheets = [];

  const templatesSearch = document.getElementById('templatesSearch');
  const worksheetsSearch = document.getElementById('worksheetsSearch');

  templatesSearch.addEventListener('input', () => renderList(templates, templatesSearch.value, 'templates'));
  worksheetsSearch.addEventListener('input', () => renderList(worksheets, worksheetsSearch.value, 'worksheets'));

  function loadTemplates() {
    fetch('/api/v1/templates')
      .then(res => res.json())
      .then(data => {
        templates = data;
        renderList(templates, templatesSearch.value, 'templates');
      })
      .catch(err => {
        const ul = document.getElementById('templatesList');
        ul.innerHTML = '<li>Error loading templates</li>';
        console.error('Error fetching templates', err);
      });
  }

  function loadWorksheets() {
    fetch('/api/v1/worksheets')
      .then(res => res.json())
      .then(data => {
        worksheets = data;
        renderList(worksheets, worksheetsSearch.value, 'worksheets');
      })
      .catch(err => {
        const ul = document.getElementById('worksheetsList');
        ul.innerHTML = '<li>Error loading worksheets</li>';
        console.error('Error fetching worksheets', err);
      });
  }

  function renderList(items, filter, type) {
    const ul = document.getElementById(type + 'List');
    ul.innerHTML = '';
    const filtered = items.filter(name => name.toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) {
      ul.innerHTML = `<li>(no ${type})</li>`;
    } else {
      filtered.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        li.addEventListener('contextmenu', e => {
          e.preventDefault();
          const menuItems = type === 'templates' ? getTemplateMenu(name) : getWorksheetMenu(name);
          createContextMenu(menuItems, e.pageX, e.pageY);
        });
        ul.appendChild(li);
      });
    }
  }

  function getTemplateMenu(name) {
    return [
      { label: 'Open', action: () => openTemplate(name) },
      { label: 'Create Instance', action: () => createWorksheet(name) },
      { label: 'Rename', action: () => renameTemplate(name) },
      { label: 'Copy', action: () => copyTemplate(name) },
      { label: 'Delete', action: () => deleteTemplate(name) }
    ];
  }

  function getWorksheetMenu(name) {
    return [
      { label: 'Open', action: () => openWorksheet(name) },
      { label: 'Make Template', action: () => createTemplateFromWorksheet(name) },
      { label: 'Rename', action: () => renameWorksheet(name) },
      { label: 'Copy', action: () => copyWorksheet(name) },
      { label: 'Delete', action: () => deleteWorksheet(name) }
    ];
  }

  function createContextMenu(items, x, y) {
    removeContextMenu();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    const ul = document.createElement('ul');
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.label;
      li.addEventListener('click', () => {
        item.action();
        removeContextMenu();
      });
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

  function openTemplate(name) {
    window.open(`canvas.html?type=template&name=${encodeURIComponent(name)}`, '_blank');
  }

  function createWorksheet(templateName) {
    const newName = prompt('Enter new worksheet name:');
    if (newName) {
      fetch(`/api/v1/worksheets?name=${encodeURIComponent(newName)}&template=${encodeURIComponent(templateName)}`, { method: 'POST' })
        .then(res => {
          if (!res.ok) return res.text().then(text => Promise.reject(text));
          loadWorksheets();
        })
        .catch(err => alert('Error creating worksheet: ' + err));
    }
  }

  function renameTemplate(oldName) {
    const newName = prompt('Enter new name for template:', oldName);
    if (newName && newName !== oldName) {
      fetch(`/api/v1/templates/${encodeURIComponent(oldName)}?newName=${encodeURIComponent(newName)}`, { method: 'PUT' })
        .then(res => {
          if (!res.ok) return res.text().then(text => Promise.reject(text));
          loadTemplates();
        })
        .catch(err => alert('Error renaming template: ' + err));
    }
  }

  function copyTemplate(sourceName) {
    const newName = prompt('Enter name for new copy of template:', sourceName + '_copy');
    if (newName) {
      fetch(`/api/v1/templates/${encodeURIComponent(sourceName)}/copy?newName=${encodeURIComponent(newName)}`, { method: 'POST' })
        .then(res => {
          if (!res.ok) return res.text().then(text => Promise.reject(text));
          loadTemplates();
        })
        .catch(err => alert('Error copying template: ' + err));
    }
  }

  function deleteTemplate(name) {
    if (confirm('Delete template ' + name + '? This cannot be undone.')) {
      fetch(`/api/v1/templates/${encodeURIComponent(name)}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) return res.text().then(text => Promise.reject(text));
          loadTemplates();
        })
        .catch(err => alert('Error deleting template: ' + err));
    }
  }

  function openWorksheet(name) {
    window.open(`canvas.html?type=worksheet&name=${encodeURIComponent(name)}`, '_blank');
  }

  function createTemplateFromWorksheet(sourceName) {
    const newName = prompt('Enter name for new template from worksheet:', sourceName + '_template');
    if (newName) {
      fetch(`/api/v1/templates?name=${encodeURIComponent(newName)}&source=${encodeURIComponent(sourceName)}`, { method: 'POST' })
        .then(res => {
          if (!res.ok) return res.text().then(text => Promise.reject(text));
          loadTemplates();
        })
        .catch(err => alert('Error creating template: ' + err));
    }
  }

  function renameWorksheet(oldName) {
    const newName = prompt('Enter new name for worksheet:', oldName);
    if (newName && newName !== oldName) {
      fetch(`/api/v1/worksheets/${encodeURIComponent(oldName)}?newName=${encodeURIComponent(newName)}`, { method: 'PUT' })
        .then(res => {
          if (!res.ok) return res.text().then(text => Promise.reject(text));
          loadWorksheets();
        })
        .catch(err => alert('Error renaming worksheet: ' + err));
    }
  }

  function copyWorksheet(sourceName) {
    const newName = prompt('Enter name for new copy of worksheet:', sourceName + '_copy');
    if (newName) {
      fetch(`/api/v1/worksheets/${encodeURIComponent(sourceName)}/copy?newName=${encodeURIComponent(newName)}`, { method: 'POST' })
        .then(res => {
          if (!res.ok) return res.text().then(text => Promise.reject(text));
          loadWorksheets();
        })
        .catch(err => alert('Error copying worksheet: ' + err));
    }
  }

  function deleteWorksheet(name) {
    if (confirm('Delete worksheet ' + name + '? This cannot be undone.')) {
      fetch(`/api/v1/worksheets/${encodeURIComponent(name)}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) return res.text().then(text => Promise.reject(text));
          loadWorksheets();
        })
        .catch(err => alert('Error deleting worksheet: ' + err));
    }
  }

  loadTemplates();
  loadWorksheets();
});