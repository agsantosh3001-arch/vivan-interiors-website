(() => {
  const host = document.querySelector('#project-directory-list');
  const projects = window.VIVAN_PROJECTS || [];
  if (!host || !projects.length) return;

  projects.forEach((project, index) => {
    const link = document.createElement('a');
    link.className = 'project-directory-card';
    link.href = `./${project.slug}/`;
    link.setAttribute('aria-label', `View ${project.name}, ${project.type} in ${project.location}`);
    link.innerHTML = `
      <div class="directory-image-wrap">
        <img src="${project.cover}" alt="${project.coverAlt}" width="2400" height="1600" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
        <span class="directory-count">${String(index + 1).padStart(2, '0')}&nbsp; / &nbsp;${String(projects.length).padStart(2, '0')}</span>
        <span class="directory-view"><i>↗</i><span>VIEW PROJECT</span></span>
      </div>
      <div class="directory-card-meta"><div><span>${project.type}&nbsp; · &nbsp;${project.location}</span><h3>${project.name}</h3><small class="directory-site">${project.siteName}</small></div><span class="directory-status">${project.status}<i></i></span></div>`;
    host.append(link);
  });
})();
