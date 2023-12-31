    
    //****************************************
    //成功関数
    //****************************************
    let map;
    let searchManager;
    let pins = [];

    //最初に実行する関数
    function GetMap() {
      navigator.geolocation.getCurrentPosition(mapsInit, mapsError, set);
    }
    

    function mapsInit(position) {
      console.log(position, '取得');
      //lat=緯度、lon=経度 を取得
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      //Map表示
      map = new Bmap("#myMap");
      map.startMap(lat, lon, "road", 20); //The place is Bellevue.

      //Pinを追加
      let pin = map.pin(lat, lon, "pink");
      //Infoboxを追加 
      Microsoft.Maps.Events.addHandler(map.map, 'click', function (e) {
        // 클릭한 위치의 좌표를 가져옵니다.
        const clickLocation = e.location;
    
        // Pin을 클릭한 위치로 이동시킵니다.
        pin.setLocation(clickLocation);
    
        // 클릭한 위치에 Infobox를 추가합니다.
        map.infobox(clickLocation.latitude, clickLocation.longitude, "おすすめスポット", "私のお気に入りの場所です");
      });

          // 마우스 클릭 이벤트 핸들러 등록 후에 searchManager 초기화
      Microsoft.Maps.loadModule("Microsoft.Maps.Search", function () {
      searchManager = new Microsoft.Maps.Search.SearchManager(map);
      });

      // 私のお気に入りの場所です = firebaseに登録された文字が入ったらどうなるでしょう？？
      map.infobox(lat, lon, "おすすめスポット", "私のお気に入りの場所です");

      document.getElementById("type").onchange = function(){
        typeid = this.value;
        let type;
        if(typeid == "load") type = "road";
        if(typeid == "aerial") type = "aerial";
        if(typeid == "canvasDark") type = "canvasDark";
        if(typeid == "canvasLight") type = "canvasLight";
        if(typeid == "birdseye") type = "birdseye";
        if(typeid == "grayscale") type = "grayscale";
        if(typeid == "streetside") type = "streetside";
        map.startMap(lat, lon, type, 20);
      }
    };

    //****************************************
    //失敗関数
    //****************************************
    function mapsError(error) {
      let e = "";
      if (error.code == 1) { //1＝位置情報取得が許可されてない（ブラウlザの設定）
        e = "位置情報が許可されてません";
      }
      if (error.code == 2) { //2＝現在地を特定できない
        e = "現在位置を特定できません";
      }
      if (error.code == 3) { //3＝位置情報を取得する前にタイムアウトになった場合
        e = "位置情報を取得する前にタイムアウトになりました";
      }
      alert("エラー：" + e);
    };

    //****************************************
    //オプション設定
    //****************************************
    const set = {
      enableHighAccuracy: true, //より高精度な位置を求める
      maximumAge: 20000, //最後の現在地情報取得が20秒以内であればその情報を再利用する設定
      timeout: 10000 //10秒以内に現在地情報を取得できなければ、処理を終了
    };

    //****************************************
    //検索機能
    //****************************************

    const searchInput = document.querySelector(".search_input");
    const searchBtn = document.querySelector(".search_btn");

    searchBtn.addEventListener("click", () => {
      if (map && map.map.entities) {
        map.map.entities.clear();
        geocodeQuery(searchInput.value);
      } 
    });

    function geocodeQuery(query){
      if(!searchManager){
        Microsoft.Maps.loadModule("Microsoft.Maps.Search", function(){
          searchManager = new Microsoft.Maps.Search.SearchManager(map);
          geocodeQuery(query)
        });
      } else {
        let searchRequest = {
          where: query,
          callback: function(r){
            if(r && r.reults && r.results.length > 0){
              let pin = new Microsoft.Maps.Pushpin(r.result[0].location);
              map.map.entities.push(pin);

              map.map.setView({bounds: r.results [0].bestView});
            };
          },
          errorCallback: function(e){
            alert("No results found");
          }
        };
        searchManager.geocode(searchRequest);
      };
    };