  // Auto-generate ID from name
    document.getElementById('fName').addEventListener('input', function() {
      const id = this.value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      document.getElementById('fId').value = id;
    });

    // Set today's date as default
    document.getElementById('fDate').valueAsDate = new Date();

    function generateJSON() {
      const name    = document.getElementById('fName').value.trim();
      const id      = document.getElementById('fId').value.trim();
      const version = document.getElementById('fVersion').value.trim();
      const cat     = document.getElementById('fCat').value;
      const size    = document.getElementById('fSize').value.trim();
      const date    = document.getElementById('fDate').value;
      const short   = document.getElementById('fShort').value.trim();
      const desc    = document.getElementById('fDesc').value.trim();
      const apk     = document.getElementById('fApk').value.trim();
      const icon    = document.getElementById('fIcon').value.trim();
      const ssRaw   = document.getElementById('fSS').value.trim();
      const verNote = document.getElementById('fVerNote').value.trim() || 'Initial release';
      const alertEl = document.getElementById('genAlert');

      // Validate
      if (!name || !id || !version || !cat || !short || !desc || !apk || !icon) {
        alertEl.textContent = '⚠️ Please fill all required fields (marked with *).';
        alertEl.className = 'alert error';
        alertEl.classList.remove('hidden');
        return;
      }
      if (!/^[a-z0-9-]+$/.test(id)) {
        alertEl.textContent = '⚠️ App ID must be lowercase letters, numbers, and hyphens only.';
        alertEl.className = 'alert error';
        alertEl.classList.remove('hidden');
        return;
      }

      alertEl.classList.add('hidden');

      // Build screenshots array
      const screenshots = ssRaw
        ? ssRaw.split('\n').map(s => `images/screenshots/${s.trim()}`).filter(Boolean)
        : [];

      // Build the JSON object
      const obj = {
        id,
        name,
        version,
        category: cat,
        size: size || 'Unknown',
        shortDesc: short,
        description: desc,
        icon: `images/icons/${icon}`,
        apkFile: `apks/${apk}`,
        screenshots,
        downloads: 0,
        rating: 0,
        ratingCount: 0,
        date,
        versionHistory: [
          { version, date, note: verNote }
        ]
      };

      const jsonStr = JSON.stringify(obj, null, 2);
      document.getElementById('jsonOut').textContent = jsonStr;
      document.getElementById('apkPath').textContent = `apks/${apk}`;
      document.getElementById('iconPath').textContent = `images/icons/${icon}`;
      document.getElementById('outputCard').classList.remove('hidden');
      document.getElementById('outputCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function copyJSON() {
      const text = document.getElementById('jsonOut').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    }

    function clearForm() {
      ['fName','fId','fVersion','fSize','fShort','fDesc','fApk','fIcon','fSS','fVerNote']
        .forEach(id => { document.getElementById(id).value = ''; });
      document.getElementById('fCat').value = '';
      document.getElementById('fDate').valueAsDate = new Date();
      document.getElementById('outputCard').classList.add('hidden');
      document.getElementById('genAlert').classList.add('hidden');
    }

    async function loadCurrentApps() {
      const el = document.getElementById('currentApps');
      el.textContent = 'Loading…';
      try {
        const r = await fetch(`data/apps.json?t=${Date.now()}`);
        const data = await r.json();
        el.textContent = JSON.stringify(data, null, 2);
      } catch(e) {
        el.textContent = 'Could not load apps.json: ' + e.message;
      }
    }