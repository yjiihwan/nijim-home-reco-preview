/* 니짐내짐 홈 추천 영역 — «체험권 이벤트 중인 센터» + «헬스장도 넷플릭스처럼 구독!» + «1일권 판매 중인 센터» + «새로 들어온 센터» 화면 규칙(플랫폼 무관 참조 구현).
   네 칸은 카드 모양·센터 수별 동작(숨김/1장/넘김/더보기)이 같고, «어떤 센터를 어떤 값으로 띄우나»만 다르다.
   앱(dmonster)이 같은 규칙으로 옮기면 되도록 순수 함수만 둔다. */
(function (root) {
  var HOME_MAX = 7;
  var DAY = 86400000;

  function ymd(s) {
    var p = String(s).split('-').map(Number);
    return Date.UTC(p[0], p[1] - 1, p[2]);
  }

  function distanceText(km) {
    if (km == null || isNaN(km)) return '';
    return km < 1 ? Math.round(km * 1000) + 'm' : (Math.round(km * 10) / 10).toFixed(1) + 'km';
  }

  function distKey(x) { return x.distanceKm == null ? Infinity : x.distanceKm; }
  function meta(x) { return [x.area, distanceText(x.distanceKm)].filter(Boolean).join(' · '); }

  // 가까운 순(거리 모름은 맨 뒤, 같으면 입력 순서 — sort는 안정 정렬). 홈 칸과 «더보기» 목록이 같은 순서를 쓰도록 한 곳에서만 정렬
  function rank(list, toCard) {
    return list.slice().sort(function (a, b) { return distKey(a) - distKey(b); }).map(toCard);
  }

  // 센터 수별 공통 동작: hidden(0곳) / solo(1곳) / rail(2곳+). 8곳 이상이면 «더보기» 카드(10-20: «N곳 모두 보기»→«더보기»)(제목 옆 «전체 N»은 v3에서 없앰)
  function layout(ranked) {
    var total = ranked.length;
    if (total === 0) return { mode: 'hidden', total: 0, cards: [], showAll: false, dots: 0 };
    var cards = ranked.slice(0, HOME_MAX);
    return {
      mode: total === 1 ? 'solo' : 'rail',
      total: total,
      cards: cards,
      showAll: total > HOME_MAX,
      dots: total === 1 ? 0 : cards.length
    };
  }

  /* ── 체험권 ── 입력 = 센터 소개 페이지에 등록된 체험권 목록(기존 데이터) */

  // 지금 회원이 센터 소개 페이지에서 받을 수 있는 체험권인가. 남은 수량 0(매진)은 받을 게 없으니 제외(10-19 확정)
  function isAvailable(t, today) {
    var d = ymd(today);
    if (t.startDate && ymd(t.startDate) > d) return false;
    if (t.endDate && ymd(t.endDate) < d) return false;
    if (t.soldOut || t.remaining === 0) return false;
    return true;
  }

  // 종료일 당일까지 진행. 오늘 마감 D-day, 7일 이내 D-n, 그보다 길면 MM.DD까지, 상시는 null
  function dueChip(endDate, today) {
    if (!endDate) return null;
    var days = Math.round((ymd(endDate) - ymd(today)) / DAY);
    if (days < 0) return null;
    if (days <= 7) return { text: days === 0 ? 'D-day' : 'D-' + days, hot: true };
    var p = endDate.split('-');
    return { text: p[1] + '.' + p[2] + '까지', hot: false };
  }

  function endKey(t) { return t.endDate ? ymd(t.endDate) : Infinity; }

  // 한 센터에 받을 수 있는 체험권이 여러 개면 마감 가장 가까운 1장만(같으면 먼저 등록된 것)
  function onePerCenter(tickets) {
    var byCenter = {}, order = [];
    tickets.forEach(function (t) {
      var k = String(t.centerId);
      if (!(k in byCenter)) { byCenter[k] = t; order.push(k); }
      else if (endKey(t) < endKey(byCenter[k])) byCenter[k] = t;
    });
    return order.map(function (k) { return byCenter[k]; });
  }

  // 매진 제외 → 센터당 1장 → 가까운 순. 순서가 중요: 매진 체험권이 같은 센터의 남은 체험권을 가리면 안 됨
  function trialRanked(tickets, today) {
    var list = onePerCenter(tickets.filter(function (t) { return isAvailable(t, today); }));
    return rank(list, function (t) {
      return {
        centerId: t.centerId,
        centerName: t.centerName,
        meta: meta(t),
        distance: distanceText(t.distanceKm),
        benefit: t.benefit,
        photo: t.photo || null,
        chip: dueChip(t.endDate, today)
      };
    });
  }
  function trialSection(tickets, today) { return layout(trialRanked(tickets, today)); }

  /* ── 구독 ── 입력 = 센터 목록 + 센터별 구독 상품(기존 데이터) */

  function onSaleProducts(c) {
    return (c.subscriptions || []).filter(function (p) { return p.onSale !== false && p.monthlyPrice > 0; });
  }

  // 앱에 노출 중 + 구독 운영 중 + 판매 중인 구독 상품 1개 이상
  function isSubscribable(c) {
    if (c.visible === false) return false;
    if (c.subscriptionActive === false) return false;
    return onSaleProducts(c).length > 0;
  }

  function won(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  // 대표 상품 = 월 가격 최저(같으면 먼저 등록된 것). 상품이 2개 이상이면 «원부터»
  function priceOf(c) {
    var ps = onSaleProducts(c);
    var best = ps.reduce(function (a, p) { return p.monthlyPrice < a.monthlyPrice ? p : a; });
    return {
      price: won(best.monthlyPrice),
      from: ps.length > 1,
      usage: best.usage || null,
      basis: best.contractMonths ? best.contractMonths + '개월 회원권 기준' : null
    };
  }

  function subsRanked(centers) {
    return rank(centers.filter(isSubscribable), function (c) {
      var p = priceOf(c);
      return {
        centerId: c.centerId,
        centerName: c.centerName,
        meta: meta(c),
        distance: distanceText(c.distanceKm),
        photo: c.photo || null,
        price: p.price, from: p.from, usage: p.usage, basis: p.basis
      };
    });
  }
  function subsSection(centers) { return layout(subsRanked(centers)); }

  /* ── 1일권 ── 입력 = 센터 목록 + 센터별 1일권 상품(기존 데이터). 구독 칸과 같은 방식 */

  function onSaleOneday(c) {
    return (c.onedays || []).filter(function (p) { return p.onSale !== false && p.price > 0; });
  }

  // 앱에 노출 중 + 판매 중인 1일권 1개 이상
  function isOnedayOn(c) {
    if (c.visible === false) return false;
    return onSaleOneday(c).length > 0;
  }

  // 대표 = 최저가(같으면 먼저 등록된 것). 판매 중 1일권이 2개 이상이면 «원부터»
  function onedayPriceOf(c) {
    var ps = onSaleOneday(c);
    var best = ps.reduce(function (a, p) { return p.price < a.price ? p : a; });
    return { price: won(best.price), from: ps.length > 1 };
  }

  function onedayRanked(centers) {
    return rank(centers.filter(isOnedayOn), function (c) {
      var p = onedayPriceOf(c);
      return {
        centerId: c.centerId,
        centerName: c.centerName,
        meta: meta(c),
        distance: distanceText(c.distanceKm),
        photo: c.photo || null,
        price: p.price, from: p.from
      };
    });
  }
  function onedaySection(centers) { return layout(onedayRanked(centers)); }


  /* ── 새로 들어온 센터(10-20 신규, 10-20 형 시정: 기준 = 온라인광고 첫 시작일) ──
     실서버에서 «입점» = 온라인광고진행(앱 노출). 센터관리 기능만 쓰는 센터(광고 미진행)는 대상 아님.
     입력 = 센터 목록 + adOn(온라인광고 진행 중) + adStartDate(온라인광고 첫 시작일, 껐다 켜도 안 바뀜 → DATA_REQUEST)
     첫 시작일 당일 = 1일째. N일째까지 노출, 다음 날 자동으로 빠짐. 광고 OFF면 기간 안이어도 즉시 빠짐 */
  // 노출 일수 = 관리자 설정값(서버 `new_center_days`). 앱에 하드코딩하지 않고, 값이 없거나 이상하면 기본 30
  var NEW_DAYS = 30, NEW_DAYS_MIN = 1, NEW_DAYS_MAX = 365;
  function normalizeNewDays(v) {
    var n = Number(v);
    return v !== null && v !== '' && Number.isInteger(n) && n >= NEW_DAYS_MIN && n <= NEW_DAYS_MAX ? n : NEW_DAYS;
  }

  function daysSince(date, today) { return Math.round((ymd(today) - ymd(date)) / DAY); }

  // 온라인광고 진행 중(=앱 노출) + 첫 시작일이 오늘 기준 0 ~ N-1일 전. 다시 켠 날은 보지 않는다(A안)
  function isNew(c, today, n) {
    if (c.adOn !== true || c.visible === false || !c.adStartDate) return false;
    var d = daysSince(c.adStartDate, today);
    return d >= 0 && d < normalizeNewDays(n);
  }

  // 가까운 순(다른 칸과 같음). 거리가 같으면 광고를 최근에 시작한 센터 먼저
  function newRanked(centers, today, n) {
    var list = centers.filter(function (c) { return isNew(c, today, n); })
      .sort(function (a, b) { return ymd(b.adStartDate) - ymd(a.adStartDate); });
    return rank(list, function (c) {
      return {
        centerId: c.centerId,
        centerName: c.centerName,
        meta: meta(c),
        distance: distanceText(c.distanceKm),
        photo: c.photo || null,
        adStartDate: c.adStartDate
      };
    });
  }
  function newSection(centers, today, n) { return layout(newRanked(centers, today, n)); }

  /* ── «더보기» 목록 화면(10-20) ── 홈 칸과 같은 규칙·같은 순서의 «전체»를 20곳씩.
     홈 1~7번째 = 목록 1~7번째. AD 센터는 섞지 않는다 */
  var LIST_PAGE_SIZE = 20;

  // 형 확인 대기 3건(정렬 버튼·센터 수·이벤트 줄). 확정되면 이 값만 바꾼다
  var LIST_OPTIONS = { sortButton: false, showCount: false, eventRow: false };

  // opt.newDays = 관리자 노출 일수(«새로 들어온 센터»만 씀)
  function listRanked(kind, input, today, opt) {
    if (kind === 'trial') return trialRanked(input, today);
    if (kind === 'subs') return subsRanked(input);
    if (kind === 'oneday') return onedayRanked(input);
    if (kind === 'new') return newRanked(input, today, opt && opt.newDays);
    throw new Error('unknown kind: ' + kind);
  }

  // page = 0부터. 서버 엔드포인트(kind·lat·lng·page)가 돌려줄 값과 같은 모양
  function listPage(kind, input, today, page, size, opt) {
    var all = listRanked(kind, input, today, opt);
    var n = size || LIST_PAGE_SIZE, from = (page || 0) * n;
    return { kind: kind, page: page || 0, items: all.slice(from, from + n), hasMore: from + n < all.length, total: all.length };
  }

  var api = {
    HOME_MAX: HOME_MAX,
    distanceText: distanceText,
    isAvailable: isAvailable, dueChip: dueChip, onePerCenter: onePerCenter, trialSection: trialSection,
    isSubscribable: isSubscribable, priceOf: priceOf, subsSection: subsSection,
    isOnedayOn: isOnedayOn, onedayPriceOf: onedayPriceOf, onedaySection: onedaySection,
    NEW_DAYS: NEW_DAYS, NEW_DAYS_MIN: NEW_DAYS_MIN, NEW_DAYS_MAX: NEW_DAYS_MAX, normalizeNewDays: normalizeNewDays, daysSince: daysSince, isNew: isNew, newSection: newSection,
    LIST_PAGE_SIZE: LIST_PAGE_SIZE, LIST_OPTIONS: LIST_OPTIONS, listRanked: listRanked, listPage: listPage
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HomeReco = api;
})(this);
