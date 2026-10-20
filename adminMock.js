/* 프로토타입 전용 «관리자 저장값» 흉내. admin.html에서 바꾼 노출 일수·센터 온라인광고 ON/OFF·첫 시작일을 home.html·list.html이 읽는다.
   실제 앱은 서버 설정값(new_center_days)과 센터 온라인광고 상태·첫 시작일(ad_first_started_at)을 API로 받는다 — 이 파일은 옮기지 않는다. */
(function (root) {
  var KEY = 'nijimAdminMock:v6.1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { return {}; } }
  function save(v) { localStorage.setItem(KEY, JSON.stringify(v)); }
  function reset() { localStorage.removeItem(KEY); }
  // 주소 ?days= (시험용) > 관리자 저장값 > 기본 30
  function newDays(q) {
    var u = q && q.get('days');
    return root.HomeReco.normalizeNewDays(u != null && u !== '' ? u : load().newDays);
  }
  function applyCenters(list) {
    var o = load().centers || {};
    return list.map(function (c) {
      var x = o[c.centerId];
      if (!x) return c;
      var y = {};
      for (var k in c) y[k] = c[k];
      if ('visible' in x) y.visible = x.visible;
      if ('adOn' in x) y.adOn = x.adOn;
      if ('adStartDate' in x) y.adStartDate = x.adStartDate;
      return y;
    });
  }
  root.AdminMock = { KEY: KEY, load: load, save: save, reset: reset, newDays: newDays, applyCenters: applyCenters };
})(this);
