/* 검증용 가상값. 기준일 2026-10-19.
   TRIAL: 한 줄 = 센터 소개 페이지에 등록된 체험권 1개. remaining = 남은 수량(null = 수량 제한 없음)
   SUBS : 한 줄 = 센터 1곳 + 구독 상품 목록. 독산·영등포 월 33,200원·하루 1회는 현행 앱 캡처 실제값, 나머지는 가상값 */
(function (root) {
  var P = 'assets/photos/';

  var base = [
    { id: 1, centerId: 1, centerName: '엔짐 독산점', area: '금천구 독산동', distanceKm: 2.1, benefit: '1일 무료 체험', startDate: '2026-10-01', endDate: '2026-10-22', remaining: 30, photo: P + 'doksan.jpg' },
    { id: 2, centerId: 2, centerName: '엔짐 상도점', area: '동작구 상도동', distanceKm: 3.1, benefit: '3일 체험권 9,900원', startDate: '2026-10-10', endDate: '2026-11-15', remaining: null, photo: P + 'sangdo.jpg' },
    { id: 3, centerId: 3, centerName: '피트니스타운', area: '관악구 봉천동', distanceKm: 4.3, benefit: '1일 체험권 5,000원', startDate: null, endDate: null, remaining: 12, photo: P + 'ftown.jpg' },
    { id: 4, centerId: 4, centerName: '보리스짐 교대점', area: '서초구 서초동', distanceKm: 9.0, benefit: 'PT 1회 무료 체험', startDate: '2026-10-15', endDate: '2026-10-24', remaining: null, photo: P + 'boris.jpg' },
    { id: 5, centerId: 5, centerName: 'NX GYM 논현점', area: '강남구 논현동', distanceKm: 10.1, benefit: '3일 무료 체험', startDate: null, endDate: '2026-11-30', remaining: 3, photo: P + 'nx.jpg' },
    { id: 6, centerId: 6, centerName: '착한헬스 강남구청점', area: '강남구 삼성동', distanceKm: 11.8, benefit: '1주 체험권 19,000원', startDate: null, endDate: '2026-10-31', remaining: null, photo: P + 'chakhan.jpg' },
    { id: 7, centerId: 7, centerName: '엔짐 답십리점', area: '동대문구 답십리동', distanceKm: 14.6, benefit: '2주 무료 체험', startDate: null, endDate: '2026-10-31', remaining: null, photo: P + 'dap.jpg' }
  ];
  var far = [
    { id: 8, centerId: 8, centerName: '센터 8', area: '노원구 상계동', distanceKm: 18.2, benefit: '1일 무료 체험', startDate: null, endDate: null, photo: P + 'dap2.jpg' },
    { id: 9, centerId: 9, centerName: '센터 9', area: '은평구 불광동', distanceKm: 19.0, benefit: '1일 무료 체험', startDate: null, endDate: null, photo: null },
    { id: 10, centerId: 10, centerName: '센터 10', area: '강서구 화곡동', distanceKm: 20.4, benefit: '1일 무료 체험', startDate: null, endDate: null, photo: null },
    { id: 11, centerId: 11, centerName: '센터 11', area: '송파구 잠실동', distanceKm: 21.0, benefit: '1일 무료 체험', startDate: null, endDate: null, photo: null },
    { id: 12, centerId: 12, centerName: '센터 12', area: '강동구 천호동', distanceKm: 22.7, benefit: '1일 무료 체험', startDate: null, endDate: null, photo: null }
  ];
  // 나오면 안 되는 것: 끝난 이벤트·시작 전 이벤트(가까워도 제외)
  var inactive = [
    { id: 90, centerId: 90, centerName: '끝난 이벤트 센터', area: '구로구', distanceKm: 0.3, benefit: '종료됨', startDate: '2026-09-01', endDate: '2026-10-18', photo: null },
    { id: 91, centerId: 91, centerName: '시작 전 센터', area: '구로구', distanceKm: 0.4, benefit: '시작 전', startDate: '2026-10-20', endDate: null, photo: null }
  ];
  // 매진(남은 수량 0) 체험권만 있는 센터 → 제외. 두 표기(remaining 0 / soldOut) 모두
  var soldOut = [
    { id: 92, centerId: 92, centerName: '매진 센터', area: '구로구', distanceKm: 0.5, benefit: '1일 무료 체험', startDate: null, endDate: null, remaining: 0, photo: null },
    { id: 93, centerId: 93, centerName: '매진 센터 2', area: '구로구', distanceKm: 0.6, benefit: '1일 무료 체험', startDate: null, endDate: '2026-10-25', soldOut: true, photo: null }
  ];
  // 같은 센터(독산점)의 두 번째 체험권(종료가 더 늦음) → 독산점 1장, 마감 임박(10-22, D-3) 것
  var dup = [{ id: 31, centerId: 1, centerName: '엔짐 독산점', area: '금천구 독산동', distanceKm: 2.1, benefit: 'PT 1회 무료 체험', startDate: null, endDate: '2026-12-31', remaining: null, photo: P + 'doksan.jpg' }];
  // 상도점: 마감이 더 가까운 체험권이 매진 → 매진은 빼고 남은 체험권(11.15까지)으로 1장. 매진 때문에 센터가 통째로 빠지면 안 됨
  var dupSold = [{ id: 32, centerId: 2, centerName: '엔짐 상도점', area: '동작구 상도동', distanceKm: 3.1, benefit: '오늘만 1일 무료', startDate: null, endDate: '2026-10-20', remaining: 0, photo: P + 'sangdo.jpg' }];
  // 피트니스타운: 오늘 마감 체험권 추가 → 마감 가장 가까운 것 = D-day
  var dupToday = [{ id: 33, centerId: 3, centerName: '피트니스타운', area: '관악구 봉천동', distanceKm: 4.3, benefit: '오늘 마감 1일 무료', startDate: null, endDate: '2026-10-19', remaining: 5, photo: P + 'ftown.jpg' }];

  var many = far.concat(inactive, soldOut, dup, dupSold, dupToday, base.slice().reverse());
  var edge = [
    { id: 21, centerId: 21, centerName: '스포애니 서울대입구역점 24시 프리미엄 피트니스 & 필라테스', area: '관악구 봉천동', distanceKm: 1.4, benefit: '1일 무료 체험', startDate: null, endDate: '2026-10-21', photo: P + 'dap2.jpg' },
    { id: 22, centerId: 22, centerName: '짐박스 신림점', area: '관악구 신림동', distanceKm: 0.8, benefit: '첫방문3일무료체험인바디측정권', startDate: null, endDate: '2026-11-10', photo: P + 'sangdo.jpg' },
    { id: 23, centerId: 23, centerName: '바디라인 필라테스 신대방점', area: '동작구 대방동', distanceKm: 1.1, benefit: '체험 수업 1회 무료', startDate: null, endDate: null, photo: null },
    { id: 24, centerId: 24, centerName: '긴 체험권 이름 센터', area: '동작구 대방동', distanceKm: 1.9, benefit: '첫 방문 3일 무료 체험 + 인바디 측정 + 운동복 무료 대여', startDate: null, endDate: '2026-10-19', photo: null }
  ];

  function sub(id, name, area, km, photo, products, extra) {
    var c = { centerId: id, centerName: name, area: area, distanceKm: km, photo: photo ? P + photo + '.jpg' : null, subscriptionActive: true, visible: true, subscriptions: products };
    for (var k in extra || {}) c[k] = extra[k];
    return c;
  }
  function prod(price, usage, months, onSale) { return { monthlyPrice: price, usage: usage, contractMonths: months == null ? 12 : months, onSale: onSale !== false }; }

  var sBase = [
    sub(101, '엔짐 독산점', '금천구 독산동', 2.1, 'doksan', [prod(33200, '하루 1회')]),
    sub(102, '엔짐 영등포점', '영등포구 영등포동', 4.1, 'dap2', [prod(33200, '하루 1회')]),
    sub(103, '엔짐 상도점', '동작구 상도동', 3.1, 'sangdo', [prod(48800, '무제한'), prod(43800, '하루 2회')]),
    sub(104, '피트니스타운', '관악구 봉천동', 4.3, 'ftown', [prod(39000, '하루 1회')]),
    sub(105, '보리스짐 교대점', '서초구 서초동', 9.0, 'boris', [prod(49000, '무제한')]),
    sub(106, 'NX GYM 논현점', '강남구 논현동', 10.1, 'nx', [prod(55000, '하루 1회')]),
    sub(107, '엔짐 답십리점', '동대문구 답십리동', 14.6, 'dap', [prod(33200, '하루 1회')])
  ];
  var sFar = [
    sub(108, '센터 108', '노원구 상계동', 18.2, 'chakhan', [prod(35000, '하루 1회')]),
    sub(109, '센터 109', '은평구 불광동', 19.0, null, [prod(35000, '하루 1회')]),
    sub(110, '센터 110', '강서구 화곡동', 20.4, null, [prod(35000, '하루 1회')]),
    sub(111, '센터 111', '송파구 잠실동', 21.0, null, [prod(35000, '하루 1회')]),
    sub(112, '센터 112', '강동구 천호동', 22.7, null, [prod(35000, '하루 1회')])
  ];
  // 나오면 안 되는 것: 구독 운영 안 함·상품 판매 중지·상품 없음·앱 비공개 센터(가까워도 제외)
  var sOff = [
    sub(190, '구독 안 하는 센터', '구로구', 0.3, null, [prod(30000, '하루 1회')], { subscriptionActive: false }),
    sub(191, '판매 중지 센터', '구로구', 0.4, null, [prod(30000, '하루 1회', 12, false)]),
    sub(192, '상품 없는 센터', '구로구', 0.5, null, []),
    sub(193, '비공개 센터', '구로구', 0.6, null, [prod(30000, '하루 1회')], { visible: false })
  ];
  var sEdge = [
    sub(121, '스포애니 서울대입구역점 24시 프리미엄 피트니스 & 필라테스', '관악구 봉천동', 1.4, 'chakhan', [prod(29900, '하루 1회')]),
    sub(122, '짐박스 신림점', '관악구 신림동', 0.8, 'sangdo', [prod(1290000, '무제한')]),
    sub(123, '바디라인 피트니스 신대방점', '동작구 대방동', 1.1, null, [prod(52000, '무제한'), prod(45000, '하루 2회')])
  ];

  /* 1일권 — 센터·가격·거리 전부 가상값 */
  function od(id, name, area, km, photo, prices, extra) {
    var c = { centerId: id, centerName: name, area: area, distanceKm: km, photo: photo ? P + photo + '.jpg' : null, visible: true,
      onedays: prices.map(function (x) { return typeof x === 'number' ? { price: x, onSale: true } : x; }) };
    for (var k in extra || {}) c[k] = extra[k];
    return c;
  }
  var oBase = [
    od(201, '피트니스타운', '관악구 봉천동', 1.6, 'ftown', [12000]),
    od(202, '엔짐 상도점', '동작구 상도동', 3.1, 'sangdo', [15000]),
    od(203, '보리스짐 교대점', '서초구 서초동', 3.8, 'boris', [20000, 25000]),
    od(204, '착한헬스 강남구청점', '강남구 삼성동', 5.2, 'chakhan', [10000]),
    od(205, 'NX GYM 논현점', '강남구 논현동', 6.4, 'nx', [25000]),
    od(206, '엔짐 독산점', '금천구 독산동', 7.9, 'doksan', [15000]),
    od(207, '엔짐 답십리점', '동대문구 답십리동', 14.6, 'dap', [15000])
  ];
  var oFar = [
    od(208, '센터 208', '노원구 상계동', 18.2, 'dap2', [15000]),
    od(209, '센터 209', '은평구 불광동', 19.0, null, [15000]),
    od(210, '센터 210', '강서구 화곡동', 20.4, null, [15000])
  ];
  // 나오면 안 되는 것: 판매 중지·1일권 없음·앱 비공개(가까워도 제외)
  var oOff = [
    od(290, '판매 중지 센터', '구로구', 0.3, null, [{ price: 10000, onSale: false }]),
    od(291, '1일권 없는 센터', '구로구', 0.4, null, []),
    od(292, '비공개 센터', '구로구', 0.5, null, [10000], { visible: false })
  ];
  var oEdge = [
    od(221, '스포애니 서울대입구역점 24시 프리미엄 피트니스 & 필라테스', '관악구 봉천동', 1.4, 'dap2', [15000]),
    od(222, '짐박스 신림점', '관악구 신림동', 0.8, 'sangdo', [100000]),
    od(223, '바디라인 피트니스 신대방점', '동작구 대방동', 1.1, null, [18000, 12000])
  ];



  /* 새로 들어온 센터(10-20) — 센터명·광고 시작일·거리 전부 시안용 가상 값(사진은 기존 센터 사진 차용). 기준일 2026-10-19, 노출 30일
     adOn = 온라인광고 진행 중(앱 노출), adStartDate = 온라인광고 첫 시작일. joinDate(서비스 가입일)는 규칙에 안 쓰임 — 차이를 보이려고 일부만 넣음 */
  function nw(id, name, area, km, photo, adStart, extra) {
    var c = { centerId: id, centerName: name, area: area, distanceKm: km, photo: photo ? P + photo + '.jpg' : null, visible: true, adOn: true, adStartDate: adStart };
    for (var k in extra || {}) c[k] = extra[k];
    return c;
  }
  var nBase = [
    nw(301, '에이블짐 신림점', '관악구 신림동', 0.8, 'sangdo', '2026-10-19'),
    nw(302, '필라온 신대방점', '동작구 대방동', 1.1, 'chakhan', '2026-10-18'),
    nw(303, '스포애니 낙성대역점 24시 프리미엄 피트니스 & 필라테스', '관악구 봉천동', 1.4, 'dap2', '2026-10-15'),
    nw(304, '오운핏 봉천점', '관악구 봉천동', 2.4, null, '2026-10-12', { joinDate: '2025-03-02' }), // 센터관리만 쓰다가 10-12에 광고 시작 → 새 센터
    nw(305, '크로스핏 원 사당', '동작구 사당동', 3.6, 'boris', '2026-10-08'),
    nw(306, '하이퍼짐 노량진점', '동작구 노량진동', 4.9, 'nx', '2026-10-02'),
    nw(307, '라온 PT 스튜디오', '영등포구 당산동', 8.3, 'ftown', '2026-09-28')
  ];
  var nFar = [
    nw(308, '핏앤짐 목동점', '양천구 목동', 11.2, 'dap', '2026-10-05'),
    nw(309, '모션필라테스 마포', '마포구 공덕동', 12.6, null, '2026-09-25'),
    nw(310, '바른몸 PT 성수', '성동구 성수동', 15.0, 'doksan', '2026-09-20')
  ];
  // 나오면 안 되는 것(가까워도 제외): N일 지남·광고 OFF·센터관리만·다시 켬(첫 시작 오래됨)·시작 예정·시작일 없음·광고 시작 전
  var nOff = [
    nw(390, '노출 끝난 센터', '구로구', 0.2, null, '2026-09-19'),
    nw(391, '광고 시작 예정 센터', '구로구', 0.3, null, '2026-10-21'),
    nw(392, '광고 시작일 없는 센터', '구로구', 0.4, null, null),
    nw(393, '광고 끈 새 센터', '구로구', 0.5, null, '2026-10-17', { adOn: false, visible: false }),
    nw(394, '광고 시작 전 센터', '구로구', 0.6, 'doksan', null, { adOn: false, visible: false, joinDate: '2026-10-10' }), // 관리자 «광고 켜기» 시연용(admin.html)
    nw(395, '센터관리만 쓰는 센터', '구로구', 0.25, null, null, { adOn: false, visible: false, joinDate: '2026-10-18' }),
    nw(396, '광고 다시 켠 센터', '구로구', 0.35, null, '2026-08-01', { joinDate: '2026-07-20' }) // 9월에 껐다 10-15에 다시 켬 — 첫 시작일 기준이라 NEW 아님
  ];
  // 형 시정 ⑤ 검증 세트: 광고 ON 신규 1곳 + 빠져야 할 셋(광고 OFF·센터관리만·N일 경과). 빠질 셋이 더 가까워서 안 걸러지면 앞에 뜬다
  var nAd4 = [
    nw(381, '광고 시작한 새 센터', '관악구 신림동', 0.9, 'sangdo', '2026-10-16', { joinDate: '2024-11-05' }),
    nw(382, '광고 끈 센터(기간 안)', '관악구 신림동', 0.2, 'nx', '2026-10-14', { adOn: false, visible: false }),
    nw(383, '센터관리만 쓰는 센터', '관악구 신림동', 0.3, 'boris', null, { adOn: false, visible: false, joinDate: '2026-10-18' }),
    nw(384, '광고 30일 지난 센터', '관악구 신림동', 0.4, 'chakhan', '2026-09-19')
  ];
  var n30 = nFar.concat(nOff, nBase.slice().reverse(), Array.from({ length: 22 }, function (_, i) { return nw(700 + i, '먼 새 센터 ' + (i + 1), '경기', 23 + i * 0.7, i % 4 ? 'nx' : null, '2026-10-' + String(1 + (i % 18)).padStart(2, '0')); }));

  /* «더보기» 목록 카드 상단(현행 검색 카드 값). 실측 = 현행 앱 캡처(독산·상도·착한헬스·NX·보리스·피트니스타운), 나머지 가상값.
     실제 앱에선 검색 API 값을 그대로 쓴다. 센터명으로 묶는 건 시안 데이터에서만(칸마다 centerId가 달라서) */
  function three(n) { return [P + n + '_main.jpg', P + n + '_s1.jpg', P + n + '_s2.jpg']; }
  var INFO = {
    '엔짐 독산점': { hearts: 937, tags: ['헬스', 'PT', 'G.T'], photos: three('doksan'), event: '추석 먹방 대비 프로젝트 / 헬스 구독 멤버십 출시 기념 이벤트' },
    '엔짐 상도점': { hearts: 1023, tags: ['헬스', 'PT', 'G.T'], photos: three('sangdo') },
    '피트니스타운': { hearts: 70, tags: ['헬스', 'PT'], photos: three('ftown') },
    '보리스짐 교대점': { hearts: 355, tags: ['헬스', 'PT'], photos: three('boris'), event: '10월 신규 등록 PT 2회 추가' },
    'NX GYM 논현점': { hearts: 86, tags: ['헬스', 'PT'], photos: three('nx') },
    '착한헬스 강남구청점': { hearts: 138, tags: ['헬스', 'PT'], photos: three('chakhan') },
    '엔짐 답십리점': { hearts: 512, tags: ['헬스', 'PT', 'G.T'], photos: [P + 'dap.jpg', P + 'dap2.jpg'] },
    '엔짐 영등포점': { hearts: 640, tags: ['헬스', 'PT', 'G.T'], photos: [P + 'dap2.jpg'] },
    '스포애니 서울대입구역점 24시 프리미엄 피트니스 & 필라테스': { hearts: 412, tags: ['헬스', 'PT', 'G.X'], photos: three('nx') },
    '짐박스 신림점': { hearts: 18, tags: ['헬스'], photos: null },
    '바디라인 필라테스 신대방점': { hearts: 41, tags: ['필라테스'], photos: three('chakhan') },
    '바디라인 피트니스 신대방점': { hearts: 41, tags: ['헬스', '필라테스'], photos: three('chakhan') },
    '에이블짐 신림점': { hearts: 5, tags: ['헬스', 'PT'], photos: three('sangdo') },
    '필라온 신대방점': { hearts: 2, tags: ['필라테스'], photos: three('chakhan') },
    '스포애니 낙성대역점 24시 프리미엄 피트니스 & 필라테스': { hearts: 14, tags: ['헬스', 'PT', 'G.X'], photos: [P + 'dap2.jpg', P + 'dap.jpg'] },
    '오운핏 봉천점': { hearts: 3, tags: ['헬스', 'PT'], photos: null },
    '크로스핏 원 사당': { hearts: 12, tags: ['크로스핏'], photos: three('boris') },
    '하이퍼짐 노량진점': { hearts: 27, tags: ['헬스', 'PT'], photos: three('nx') },
    '라온 PT 스튜디오': { hearts: 9, tags: ['PT'], photos: three('ftown') },
    '경계 시험 센터(09.20 입점)': { hearts: 1, tags: ['헬스'], photos: three('boris') },
    '승인 대기 센터': { hearts: 0, tags: ['헬스'], photos: three('doksan') }
  };
  root.cardInfo = function (c) {
    var i = INFO[c.centerName];
    if (i) return i;
    return { hearts: 10 + (Number(c.centerId) % 90), tags: ['헬스'], photos: c.photo ? [c.photo] : null };
  };

  // 목록 이어 불러오기(20곳씩) 검증용 30곳+: 기존 12곳(10곳) + 먼 센터 + 거리 모름 1곳(맨 뒤)
  function farTrial(i) { return { id: 400 + i, centerId: 400 + i, centerName: '먼 센터 ' + i, area: '경기 ' + i + '동', distanceKm: 23 + i * 0.7, benefit: '1일 무료 체험', startDate: null, endDate: i % 3 ? '2026-11-' + (10 + i) : null, photo: i % 4 ? P + 'nx.jpg' : null }; }
  var t30 = many.concat(Array.from({ length: 22 }, function (_, i) { return farTrial(i + 1); }),
    [{ id: 499, centerId: 499, centerName: '바디라인 필라테스 신대방점', area: '동작구 대방동', distanceKm: null, benefit: '체험 수업 1회 무료', startDate: null, endDate: '2026-11-08', photo: P + 'chakhan.jpg' }]);

  var s30 = sFar.concat(sOff, sBase.slice().reverse(), Array.from({ length: 22 }, function (_, i) { return sub(500 + i, '먼 센터 ' + (i + 1), '경기', 23 + i * 0.7, i % 4 ? 'nx' : null, [prod(30000 + i * 1000, i % 2 ? '하루 2회' : '하루 1회')]); }),
    [sub(599, '바디라인 필라테스 신대방점', '동작구 대방동', null, 'chakhan', [prod(129000, '주 2회'), prod(139000, '주 3회')])]);
  var o30 = oFar.concat(oOff, oBase.slice().reverse(), Array.from({ length: 22 }, function (_, i) { return od(600 + i, '먼 센터 ' + (i + 1), '경기', 23 + i * 0.7, i % 4 ? 'nx' : null, [10000 + i * 500]); }),
    [od(699, '바디라인 필라테스 신대방점', '동작구 대방동', null, 'chakhan', [25000])]);

  root.SAMPLE = {
    trial: {
      n0: inactive.concat(soldOut),
      n1: [base[0]].concat(dup, inactive, soldOut),
      n2: base.slice(0, 2),
      n7: base.slice(),
      n12: many,
      n30: t30,
      edge: edge
    },
    subs: {
      n0: sOff,
      n1: [sBase[0]].concat(sOff),
      n2: sBase.slice(0, 2),
      n7: sBase.slice(),
      n12: sFar.concat(sOff, sBase.slice().reverse()),
      n30: s30,
      edge: sEdge
    },
    oneday: {
      n0: oOff,
      n1: [oBase[1]].concat(oOff),
      n2: oBase.slice(0, 2),
      n7: oBase.slice(),
      n10: oFar.concat(oOff, oBase.slice().reverse()),
      n30: o30,
      edge: oEdge
    },
    newc: {
      n0: nOff,
      n1: [nBase[0]].concat(nOff),
      n2: nBase.slice(0, 2),
      n7: nBase.slice(),
      n10: nFar.concat(nOff, nBase.slice().reverse()),
      n30: n30,
      ad4: nAd4,
      ad4off: nAd4.slice(1),
      nb: [nw(321, '경계 시험 센터(09.20 광고 시작)', '관악구 신림동', 0.5, 'boris', '2026-09-20'), nBase[2], nBase[3]]
    }
  };
})(this);
