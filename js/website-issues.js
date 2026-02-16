// Populate "Current issues on the website" tooltip from Supabase website_issues table.
// Table columns expected: issue (or description), expected_fix_date.

(function () {
  var url = window.SUPABASE_URL;
  var key = window.SUPABASE_ANON_KEY;
  var table = window.SUPABASE_WEBSITE_ISSUES_TABLE || 'website_issues';

  function supabaseHeaders(k) {
    return {
      apikey: k,
      Authorization: 'Bearer ' + k,
      'Content-Type': 'application/json'
    };
  }

  function getIssueText(row) {
    if (!row) return '';
    var t = row.issue || row.description || row.issue_text || '';
    return String(t).trim();
  }

  function getExpectedFixDate(row) {
    if (!row) return null;
    var d = row.expected_fix_date;
    if (d == null || d === '') return null;
    return String(d).trim();
  }

  function formatDate(value) {
    if (!value) return '';
    var date = new Date(value);
    if (isNaN(date.getTime())) return value;
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-AU', options);
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderTooltipList(issues) {
    var tooltip = document.getElementById('sidebar-issues-tooltip');
    if (!tooltip) return;
    var ul = tooltip.querySelector('ul');
    if (!ul) return;

    if (!issues || issues.length === 0) {
      ul.innerHTML = '<li>No visible issues present.</li>';
      return;
    }

    var html = '';
    for (var i = 0; i < issues.length; i++) {
      var row = issues[i];
      var issueText = getIssueText(row);
      var expectedDate = getExpectedFixDate(row);
      html += '<li class="sidebar-footer__issues-item">';
      html += '<span class="sidebar-footer__issues-issue-text">' + escapeHtml(issueText) + '</span>';
      if (expectedDate) {
        html += '<span class="sidebar-footer__issues-expected-wrap">';
        html += '<strong class="sidebar-footer__issues-expected-label">Expected fix date</strong> ';
        html += '<span class="sidebar-footer__issues-expected-value">' + escapeHtml(formatDate(expectedDate)) + '</span>';
        html += '</span>';
      }
      html += '</li>';
    }
    ul.innerHTML = html;
  }

  function loadIssues() {
    if (!url || !key) {
      renderTooltipList([]);
      return;
    }
    var select = encodeURIComponent('*');
    var endpoint = url + '/rest/v1/' + table + '?select=' + select + '&order=id.asc';
    fetch(endpoint, { headers: supabaseHeaders(key) })
      .then(function (res) {
        if (!res.ok) return [];
        return res.json();
      })
      .then(function (data) {
        renderTooltipList(Array.isArray(data) ? data : []);
      })
      .catch(function () {
        renderTooltipList([]);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIssues);
  } else {
    loadIssues();
  }
})();
