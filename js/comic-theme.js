(function(root){
'use strict';
const C={
 props:['floral','bunny','scepter','feather','rose','paddle','paw','gel','net','stars'],
 nav:{education:'stars',rest:'bunny',market:'chest',talk:'ribbon',schedule:'timer',clinic:'gel'},
 courses:{hospitality:'ribbon',cleaning:'feather',role:'paddle',voice:'bunny',reading:null,fitness:'paw'},
 service:{talk:'stars',party:'candy',care:'feather',detail:'brush'},
 greetings:['호호, 어서 오세요. 미소는 덤, 할인은 별도랍니다!','어서 와, 오빠! 오늘 메뉴는 멀쩡해. 아마도!','우하하! 일단 앉아! 잔은 작아도 환영은 크게 하지!','어서 와! 깃털은 구경만, 팁은 넣어 주기!','어머, 손님. 자리도 넉넉하고 계산서도 넉넉해요.','어서 오너라! 이 몸의 귀한 손님이니 잔부터 데워 주마.','어서 와! 산책은 나중에, 주문은 지금!','어서 와! 오늘도 말랑말랑 정상 영업이야!','어서 오세요. 손은 많지만 주문은 차례대로랍니다.','왔네? 지갑도 같이 왔지? 좋아, 환영해!'],
 checkout:['호호, 다음에도 지갑과 함께 오세요!','고마워, 오빠! 다음엔 새 리본 자랑할게!','우하하! 다음 잔은 다음 계산서에 적어 두지!','또 와! 오늘 빠진 깃털은 기념품이야!','다음에도 천천히 들러요. 계산만 빨리 하고요.','훌륭한 손님이었다! 다음에도 이 몸을 지명하도록!','또 와! 다음엔 진짜 산책도 가자!','촉촉하게 쉬고 깔끔하게 계산했네! 또 와!','다음 예약도 두 손으로 받겠습니다. 나머지 손은 설거지 중이에요.','잘 가! 단골 할인은 계속 검토 중이야. 검토만!'],
 portrait(src,kind='staff',attrs='',alt='',extra=''){return `<span class="comic-portrait ${kind} ${extra}" ${attrs}><img class="comic-photo" src="${src}" alt="${alt}"><img class="comic-frame" src="assets/comic-${kind}.png" alt="" aria-hidden="true"></span>`;},
 icon(name,cls=''){return `<img class="comic-prop ${cls}" src="assets/comic-${name}.png" alt="" aria-hidden="true">`;}
};root.TavernComic=C;
// Only presentation fields are themed. Economy, schedules, growth and service effects stay intact.
for(const c of root.TavernData.COURSES)if(C.courses[c.id])c.icon='comic-'+C.courses[c.id]+'.png';
})(window);
