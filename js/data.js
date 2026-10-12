(function(root){
const races=['elf','human','dwarf','harpy','lamia','dragon','beast','slime','spider','darkelf'];
const names=['엘프','인간','드워프','하피','라미아','용족','수인','슬라임걸','거미여인','다크엘프'];
const stats=[[70,92,75,86,65],[82,74,83,72,84],[96,62,78,64,95],[66,70,94,82,78],[78,85,77,94,67],[95,80,91,75,70],[88,60,87,80,92],[79,69,80,88,86],[85,92,65,82,94],[72,95,85,90,62]];
const STAFF=races.map((race,i)=>({id:i,race,name:names[i],stats:{stamina:stats[i][0],lore:stats[i][1],charisma:stats[i][2],charm:stats[i][3],dexterity:stats[i][4]},level:1,xp:0,accessories:[],affinity:0,storyStage:0,outfits:['service','party','swim','casual'],outfit:'service',wage:70}));
const NEEDS=[{id:'lore',name:'이야기',detail:'전설과 여행담을 듣고 싶어 합니다.',line:'이 근처에 오래된 유적이 있다던데, 아는 이야기가 있소?'},{id:'charisma',name:'흥겨움',detail:'활기찬 분위기를 좋아합니다.',line:'드디어 거래를 끝냈지! 오늘은 신나게 한잔하고 싶군.'},{id:'charm',name:'다정함',detail:'편안하고 다정한 접객을 원합니다.',line:'먼 길을 와서 지쳤네. 잠시 편하게 쉬어가고 싶어.'},{id:'dexterity',name:'능숙함',detail:'세심하고 능숙한 서비스를 원합니다.',line:'내일 아침에 출발해야 해. 식사와 한잔을 잘 부탁하네.'}];
const MENUS=[
{id:'orange',category:'drink',name:'오렌지 주스',tag:'상큼함',price:65,cost:16,icon:'menu-13.png',desc:'갓 짠 오렌지의 산뜻한 맛. 여행객에게 인기 있는 음료.'},
{id:'berry',category:'drink',name:'산딸기 주스',tag:'달콤함',price:75,cost:20,icon:'menu-14.png',desc:'향긋한 산딸기를 으깨 만든 달콤한 음료.'},
{id:'tea',category:'drink',name:'따뜻한 허브차',tag:'편안함',price:50,cost:12,icon:'menu-19.png',desc:'몸을 녹여주는 향긋한 차. 조용히 쉬고 싶은 손님에게 어울립니다.'},
{id:'cheese',category:'food',name:'숙성 치즈 접시',tag:'든든함',price:120,cost:34,icon:'menu-49.png',desc:'진한 치즈를 넉넉하게 담았습니다. 맥주와 잘 어울립니다.'},
{id:'bread',category:'food',name:'바삭한 빵 바구니',tag:'든든함',price:90,cost:22,icon:'menu-46.png',desc:'따뜻하게 구운 빵. 부담 없이 배를 채우는 메뉴.'},
{id:'fruit',category:'food',name:'계절 과일 접시',tag:'상큼함',price:105,cost:27,icon:'menu-30.png',desc:'시장에 도착한 제철 과일을 모은 산뜻한 한 접시.'},
{id:'tart',category:'food',name:'숲딸기 타르트',tag:'달콤함',price:150,cost:43,icon:'menu-63.png',desc:'바삭한 과자 위에 크림과 숲딸기를 올렸습니다.'},
{id:'ale',category:'alcohol',name:'드워프 흑맥주',tag:'진한 맛',price:125,cost:32,icon:'menu-0.png',desc:'거품이 풍성하고 깊은 맛이 나는 드워프 양조장 맥주.'},
{id:'wine',category:'alcohol',name:'붉은 포도주',tag:'향긋함',price:180,cost:52,icon:'menu-10.png',desc:'천천히 음미하기 좋은 포도주. 이야기 자리와 어울립니다.'},
{id:'cider',category:'alcohol',name:'황금 사과주',tag:'달콤함',price:145,cost:38,icon:'menu-11.png',desc:'사과 향이 남는 부드러운 술. 가볍게 마시기 좋습니다.'}
];
const REQUESTS={drink:{label:'음료',icon:'menu-13.png'},food:{label:'음식',icon:'menu-49.png'},alcohol:{label:'주류',icon:'menu-10.png'},service:{label:'서비스',icon:'icon-service.png'},extension:{label:'연장',icon:'icon-extend.png'},checkout:{label:'계산',icon:'icon-checkout.png'}};
const SERVICES=[{id:'talk',name:'여행담과 전설을 나눈다',need:'lore',energy:3,line:'오래된 숲에는 아직 작은 정령들이 살고 있대요. 길에서 만나셨나요?'},{id:'party',name:'흥겨운 건배를 제안한다',need:'charisma',energy:6,line:'오늘의 좋은 소식에 건배! 여기 계신 분들도 함께해 주세요.'},{id:'care',name:'편안하게 이야기를 들어준다',need:'charm',energy:3,line:'정말 먼 길을 오셨네요. 오늘은 여기서 편하게 쉬어 가세요.'},{id:'detail',name:'잔과 식탁을 세심히 정돈한다',need:'dexterity',energy:4,line:'빈 접시는 치워드릴게요. 더 필요한 것이 있으시면 말씀해 주세요.'}];
const GUEST_NAMES=['길드 용병','젊은 상인','순례자','견습 기사','광산 일꾼','왕도 서기관','노년 귀족','골목 장인','검술 수련생','해상 상인','여행 음악가','은퇴 기사','약초 연구자','마을 주민','떠돌이 학자','시장 중개인','궁정 사절','성문 경비병','귀족 청년','숲의 사냥꾼','도서관 조수','행상인','백발 마법사','견습 연금술사','왕실 심부름꾼','대장장이','장거리 여행객','수도원 방문객','청년 모험가','노련한 경비대장'];
const CONFIG={duration:180,spawnInterval:12,maxGuests:14,waitLimit:55,unassignedLimit:55,requestLimit:70,initialCash:3000,initialStock:4,extensionFee:40};
const api={STAFF,NEEDS,MENUS,REQUESTS,SERVICES,GUEST_NAMES,CONFIG};root.TavernData=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
