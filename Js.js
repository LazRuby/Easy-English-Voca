
var words = new Array();
var words_backup = new Array();
var false_words = new Array();
var suv_words = new Array();

var words_count;
var false_words_count;
var now_count = 0;

var eng_time = 2000;
var kor_time = 2000;

var eng_act;
var kor_act;
var stop_count = 0;

var time_remaining;
var time_sec;
var time_min;
var time_hour;

var self_count = 0;
var self_switch = false;

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

window.onload = function () {
    
    $('#file_button').click(function() { $('#hidden_file').click(); });
    
    $('#suffle_btn').click(function() { shuffle(words); });
    
    $('#start_eng_btn').click(function() { start("eng"); });
    $('#start_false_btn').click(function() { start("false"); });
    $('#start_self_btn').click(function() { start("self"); });
    $('#start_suv_btn').click(function() { 
        if(suv_words.length == 0) { alert("단어가 없습니다."); return;}
        start("suv"); 
    });
    
    $('#print_false_eng').click(function() { copy("false_eng"); });
    $('#print_false_kor').click(function() { copy("false_kor"); });
    
    $('#help_icon').click(function() { help(1); });
    $('#help_close').click(function() { help(2); });
    
    $('#eng_time').change(function(){
        eng_time = $("#eng_time option:selected").val();
        kor_time = $("#kor_time option:selected").val();
    });
    $('#kor_time').change(function(){
        eng_time = $("#eng_time option:selected").val();
        kor_time = $("#kor_time option:selected").val();
    });
    
    $("body").keydown(function(e) {
        
        if((now_count == 0)&&(e.keyCode=='37')) { 
            now_count=0; 
            $('#words_center').html('<div id="stat">이전 단어가 없습니다."<br>"');
        }
          
        if(e.keyCode=='32') {
            
            if(self_switch == true) { return; }
            else {
                if(stop_count==0) {
                    clearTimeout(eng_act); clearTimeout(kor_act);
                    $('#words_center').append("<br><br><div class='mini_font'> 일시 정지 中 </div>");
                }
                else {
                   $('#words').html('');
                    eng_loop(); 
                }

                stop_count = (stop_count+1)%2;
            }
        } // 스페이스바 32 정지/이어하기
        
        if(e.keyCode=='8') {
            if(self_switch == true) { return; }
            else {
                now_count--;
                stop_count=0;
                clearTimeout(eng_act); clearTimeout(kor_act);
                eng_loop(); 
            }
        } // 백스페이스바 8 이전 단어로 이동
        
        if(e.keyCode=='13') {
            
            if(self_switch == "suv") {
                suv_words[now_count].temp = "suv";
                $('#words_center').append("<br><br><div class='mini_font'><br>서바이벌을 한 회차 완료해도<br>이 단어는 계속 보입니다. </div>");
            }
            else {
                false_words.push( words[now_count] );        
                $('#words_center').append("<br><br><div class='mini_font'> 현재 단어를 오답단어에 추가하였습니다. </div>");
            }
            
        } // 엔터 13 현재 단어 저장
        
        if(e.keyCode=='27') {
            
            now_count = 0;
            stop_count==0;
            self_switch = false;
            clearTimeout(eng_act); clearTimeout(kor_act);
            
            $('#words_center').css("visibility","hidden");
            $('#menu_center').css("visibility","visible");
        } // ESC 27 처음 화면으로 이동

        if((e.keyCode=='37')&&(now_count != 0)) { self_move(37); } // <- 왼쪽 키 37 이전 단어

        if(e.keyCode=='39') { self_move(39); } // -> 왼쪽 키 39 다음 단어
        
        if(e.keyCode=='65') { console.log("테스트 키입력 발생") } // A 65 테스트용 키입력
        
    });
       
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function readExcel() {
    
    var input = event.target;
    var reader = new FileReader();
    
    reader.onload = function () {
        
        var data = reader.result;
        var workBook = XLSX.read(data, { type: 'binary' });
        
        workBook.SheetNames.forEach(function (sheetName) {
            var temp_arr = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
            save_words(temp_arr);
        })
    };
    reader.readAsBinaryString(input.files[0]);
    
    $("#first_center").remove();
    $('#menu_center').css("visibility","visible");
}

function save_words(temp_arr){
    words = temp_arr;
    words_backup = temp_arr;
    suv_words = temp_arr;
    words_count = words.length;
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function shuffle(arr) { 
    
    var i, j, x;
    
    for (i = arr.length; i; i -= 1) { 
        
        j = Math.floor(Math.random() * i); 
        
        x = arr[i - 1]; 
        arr[i - 1] = arr[j]; 
        arr[j] = x; 
    } 
    
    alert("단어를 무작위로 섞었습니다.");
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function time_update() {
    
    time_remaining = ( words_count - now_count ) * ( eng_time*1 + kor_time*1 ) / 1000;
    time_sec = time_remaining%60;
    time_min = parseInt(time_remaining/60);
    time_hour = parseInt(time_remaining/60/60);
    
    $('#words_center').html('<div id="stat">단어 진행도 : ' + now_count + " / " + parseInt(words_count*1-1) +"<br>");
    
    if((self_switch==true)||(self_switch=="suv")) { return; }
    else {
        if (time_hour>0) { $('#stat').append("남은 시간 : " + time_hour + "시간<br>"); }
        if (time_min>0) { $('#stat').append("남은 시간 : " + time_min + "분<br>"); }
        $('#stat').append("남은 시간 : " + time_sec + "초 </div><br><br><br>");
    }
}

function false_time_update() {
    
    time_remaining = ( false_words_count - now_count ) * ( eng_time*1 + kor_time*1 ) / 1000;
    time_sec = time_remaining%60;
    time_min = parseInt(time_remaining/60);
    time_hour = parseInt(time_remaining/60/60);
    
    $('#words_center').html('<div id="stat">단어 진행도 : ' + now_count + " / " + parseInt(false_words_count*1-1) +"<br>");
    
    if(time_hour>0) { $('#stat').append("남은 시간 : " + time_hour + "시간<br>"); }
    if(time_min>0) { $('#stat').append("남은 시간 : " + time_min + "분<br>"); }
    $('#stat').append("남은 시간 : " + time_sec + "초 </div><br><br><br>");
}

function suv_time_update() {
    $('#words_center').html('<div id="stat">단어 진행도 : ' + now_count + " / " + parseInt(suv_words.length*1-1) +"<br>");
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function start(type) {
    
    $('#words_center').css("visibility","visible");
    $('#menu_center').css("visibility","hidden");
    
    now_count = 0;
    self_count = 0;
    
    false_words_count = false_words.length;
    
    switch(type) {
        case "eng" :
            eng_loop(); break;
        case "false" :
            false_loop(); break;     
        case "self" :
            self_start(); break;
        case "suv" :
            suv_start(); break ;
    }
}

function print_kor(type) {
    
    if(type == true) {
        var kor_temp = words[now_count].kor.split(/[.,]/);

        for(var i=0; i<kor_temp.length; i++) {
            $('#words').append(kor_temp[i] + "<br>");
        }

        $('#words').append("</div>");
    }
    else if(type == false) {
        var kor_temp = false_words[now_count].kor.split(/[.,]/);

        for(var i=0; i<kor_temp.length; i++) {
            $('#words').append(kor_temp[i] + "<br>");
        }

        $('#words').append("</div>");
    }
    else if(type == "suv") {
        var kor_temp = suv_words[now_count].kor.split(/[.,]/);

        for(var i=0; i<kor_temp.length; i++) {
            $('#words').append(kor_temp[i] + "<br>");
        }

        $('#words').append("</div>");
    }
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function eng_loop() {
    
    time_update();
    
    if(now_count>=words_count) { $('#words_center').append("<br><br><div class='mini_font'>학습이 끝났습니다.<br>ESC를 눌러 뒤로 이동하세요.</div>"); return;}
    
    $('#words_center').append("<div id='words'>" + words[now_count].eng + "<br>");
        
    eng_act = setTimeout(() =>{
        
        print_kor(true);
        
        kor_act = setTimeout(() => { 
            now_count++;
            eng_loop();
        }, kor_time); 

    }, eng_time);
}

function false_loop() {
    
    false_time_update();
    
    if(now_count>=false_words_count) { $('#words_center').append("<br><br><div class='mini_font'>학습이 끝났습니다.<br>ESC를 눌러 뒤로 이동하세요.</div>"); return;}
    
    $('#words_center').append("<div id='words'>" + false_words[now_count].eng + "<br>");
        
    eng_act = setTimeout(() =>{
        
        print_kor(false);
        
        kor_act = setTimeout(() => { 
            now_count++;
            false_loop();
        }, kor_time); 
        
    }, eng_time);
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function self_start() {
    self_switch = true;
    time_update();
    $('#words_center').append("<div id='words'>" + words[now_count].eng + "<br>");
}

function suv_start() {
    self_switch = "suv";
    suv_time_update();
    $('#words_center').append("<div id='words'>" + suv_words[now_count].eng + "<br>");
}

function self_move(where) {
    
    if(self_switch == false) { return; }
    
    if(self_switch == "suv"){
        
        if(where==37){
        
            if(self_count==0) { 
                now_count--;
                suv_time_update();
                $('#words_center').append("<div id='words'>" + suv_words[now_count].eng + "<br>");
                print_kor("suv");
            }
            else { 
                suv_time_update();
                $('#words_center').append("<div id='words'>" + suv_words[now_count].eng + "<br>"); 
            }
        }
    
        else if(where==39) {
            
            if(self_count==1) { 
                now_count++;
                suv_time_update();
                
                if(now_count >= suv_words.length) {
                    
                    console.log(suv_words);
                    console.log("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ");
            
                    var suv_temp = 0;
                    var suv_temp2 = suv_words.length;
                    var temp_arr = new Array();

                    for(var i=0; i<suv_words.length; i++) {
                        if(suv_words[i].temp=="suv") {
                            temp_arr.push(suv_words[i]);
                            suv_temp++;
                        }
                    }
                    
                    suv_words = temp_arr;
                    
                    for(var i=0; i<suv_words.length; i++) {
                        suv_words[i].temp = "x";
                    }

                    alert("총 " + suv_temp2 + "개의 단어중 " + (suv_temp2-suv_temp) + "단어가 지워지고 " + suv_temp + "개의 단어가 남았습니다.");
                    $('#words_center').append("<br><br><div class='mini_font'>학습이 끝났습니다.<br>ESC를 눌러 뒤로 이동하세요.</div>");
                    return;
                }
                
                $('#words_center').append("<div id='words'>" + suv_words[now_count].eng + "<br>");
            }
            else { 
                suv_time_update();
                $('#words_center').append("<div id='words'>" + suv_words[now_count].eng + "<br>"); 
                print_kor("suv");
            }
        }

        self_count++;
        self_count = self_count%2;
    }
    
    else if(self_switch == true) {

        if(where==37){
            
            if(self_count==0) { 
                now_count--;
                time_update();
                $('#words_center').append("<div id='words'>" + words[now_count].eng + "<br>");
                print_kor(true);
            }
            else { 
                time_update();
                $('#words_center').append("<div id='words'>" + words[now_count].eng + "<br>"); 
            }
        }
    
        else if(where==39) {
            
            if(self_count==1) { 
                now_count++;
                time_update();
                
                if(now_count >= words.length) {
                    $('#words_center').html('<div id="stat">더이상 단어가 없습니다.<br>ESC를 눌러 뒤로 이동하세요.<br>');
                    return;
                }
                
                $('#words_center').append("<div id='words'>" + words[now_count].eng + "<br>");
            }
            else { 
                time_update();
                $('#words_center').append("<div id='words'>" + words[now_count].eng + "<br>"); 
                print_kor(true);
            }
        }

        self_count++;
        self_count = self_count%2;
    }
    
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function copy(what) {
    
    $('#false_words').html("");
    
    if(what=="false_eng") { 
        for(var i=0; i<false_words.length; i++) { 
            $('#false_words').append(false_words[i].eng + "\n" ) ;
        } 
    }
    else if(what=="false_kor") { 
        for(var i=0; i<false_words.length; i++) { 
            $('#false_words').append(false_words[i].kor + "\n" ) ;
        } 
    }
    
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = $('#false_words').html();
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    
    alert("복사 완료");
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function help(what) {
    
    if(what == 1) {
        $('#help_area').css("visibility","visible");
    }
    else {
        $('#help_area').css("visibility","hidden");
    }
}