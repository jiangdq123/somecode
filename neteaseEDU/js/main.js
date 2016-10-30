//工具函数


/**通过id选择元素
 *@param	{String} id 元素的id
 *returns	{Object} 返回元素对象
 */
function $(id){
	return document.getElementById(id);
}

/**事件绑定函数
 *@param	{Object} obj 需要绑定事件的元素对象
 *@param	{String} name 要绑定的事件名称
 *@param	{Function} fn 事件触发的函数
 */
function myAddEvent(obj,name,fn){
	if (obj.addEventListener) {
		obj.addEventListener(name,fn,false)
	}
	else{
		obj.attachEvent("on"+name,fn)
	}
}

//cookie

/**获取cookie
 *@param	{String} name cookie名
 *returns	{String} 返回cookie值 未查询到时返回空字符串
*/

function getCookie(name){
	var arr=document.cookie.split(";");
	for (var i = 0; i < arr.length; i++) {
		var arr2=arr[i].split("=");
		if (arr2[0]==name) {
			return arr2[1];
		}
	}
	return "";
}

/**设置cookie
 *@param	{String} name 要设置的cookie名称
 *@param	{String} value 要设置的cookie值
 *@param	{Number} expireDays 设置cookie的过期时间
*/
function setCookie(name,value,expireDays){
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expireDays);
	document.cookie=name+"="+value+";expires="+exdate;
}

/**删除cookie
 *@param	{String} name 想要删除的cookie名称
*/
function removeCookie(name){
	setCookie(name,0,-1);
}

/**AJAX函数
 *@param	{String} type 请求类型(GET or POST)
 *@param	{String} url 请求地址
 *@param	{Object} data 请求的数据信息
 *@param	{Function} success 请求成功执行函数
 *@param	{Function} failed 请求失败执行函数
*/
function AJAX(type,url,data,success,failed){
	//创建AJAX对象
	var oAjax=null;
	if (window.XMLHttpRequest) {
		oAjax=new XMLHttpRequest;
	}
	else{
		oAjax=new ActiveXObject("Microsoft.XMLHTTP");
	}
	var type=type.toUpperCase();

	var random=Math.random();

	if (typeof data=="object") {
		var str="";
		for (var key in data) {
			str+=key+"="+data[key]+"&";
		}
		data=str.replace(/&$/,"");
	}
	//连接服务器
	if (type=="GET") {
		if (data) {
			oAjax.open("GET",url+"?"+data,true)
		}
		else{
			oAjax.open("GET",url+"?t="+random,true);
		}
		oAjax.send();
	}
	else if(type="POST"){
		oAjax.open("POST",url,true);
		oAjax.setRequestHeader("Content-type","application/x-www-form-urlencoded")
		oAjax.send(data);
	}
	//处理返回数据
	oAjax.onreadystatechange=function(){
		if (oAjax.readyState==4) {
			if (oAjax.status==200) {

				success(oAjax.responseText)
			}
			else{
				if (failed) {
					failed(oAjax.status);
				}
			}
		}
	}
}


//主页面

//顶部通知
function topNotice(){
	//点击不再显示设置cookie
	myAddEvent($("no-notice"),"click",function(){
		$("notice").style.display="none";
		setCookie("no-notice","yes",30);
	})
	if (getCookie("no-notice")!=="yes") {
		$("notice").style.display="block";
	}
}

//关注 登陆层
function signIn(){
	var login=document.getElementsByClassName("login-wrap")[0];
	var followIcon=$("follow").getElementsByTagName("span")[0];
	if (getCookie(" username")!==""&&getCookie(" password")!=="") {
		$("follow-remove").style.display="block";
		followIcon.style.display="none";
	}
	myAddEvent(followIcon,"click",function(){
		login.style.display="block";
	})
	myAddEvent($("login-close"),"click",function(){
		login.style.display="none";
	})
	myAddEvent($("login-btn"),"click",function(){
		var userIpt=$("login-form").getElementsByTagName("input")[0];
		var passIpt=$("login-form").getElementsByTagName("input")[1];
		if (userIpt.value==""||passIpt.value=="") {
			$("login-error").style.display="block";
		}
		else{
			setCookie("username",userIpt.value,30);
			setCookie("password",passIpt.value,30);
			$("login-error").style.display="none";
			login.style.display="none";
			$("follow-remove").style.display="block";
			followIcon.style.display="none";			
		}
	})
	myAddEvent($("remove-define"),"click",function(){
		$("follow-remove").style.display="none";
		$("follow").getElementsByTagName("span")[0].style.display="block";
	})
}

//轮播图
function sliderInit(){
	var aLi=$("slideshow-nav").getElementsByTagName('li');
	var timer=null;
	var picIndex=0;
	//利用闭包绑定点击事件
	for (var i = 0; i < aLi.length; i++) {
		(function(x){
			myAddEvent(aLi[i],"click",function(){
				picChange(x);
			})
		})(i)
	}
	//鼠标移入移出
	myAddEvent($("slideshow"),"mouseover",function(){
		clearInterval(timer)
	})
	myAddEvent($("slideshow"),"mouseout",function(){
		autoChange();
	})
	//图片自动轮播
	function autoChange(){
		timer=setInterval(function(){
			picIndex++;
			if (picIndex==$("slideshow-nav").getElementsByTagName('li').length) {
				picIndex=0;
			}
			picChange(picIndex);
		},5000)
	}
	//图片切换
	function picChange(x){
		var aA=$("slideshow").getElementsByTagName('a');
		for (var i = 0; i < aLi.length; i++) {
			aLi[i].className="";
			aA[i].style.display="none";
		}
		aLi[x].className="active"
		aA[x].style.display="block"
	}
	autoChange();
}



//环境展示无缝滚动
function scrollInit(){
	var aLi=$("environment-ul").getElementsByTagName('li');
	var timer=null;
	$("environment-ul").innerHTML+=$("environment-ul").innerHTML;
	$("environment-ul").style.width=aLi.length*aLi[0].offsetWidth+"px";
	myAddEvent($("environment-ul"),"mouseover",function(){
		clearInterval(timer);
	});
	myAddEvent($("environment-ul"),"mouseout",function(){
		autoScroll();
	});
	//自动滚动
	function autoScroll(){
		timer=setInterval(function(){
			if ($("environment-ul").offsetLeft>-$("environment-ul").offsetWidth/2) {
				$("environment-ul").style.left=$("environment-ul").offsetLeft-1+"px";
			}
			else{
				$("environment-ul").style.left=0;
			}
		},30)
	}
	autoScroll();
}

//课程列表

function courseList(){
	//页面数据
	var pageNoNumber=1;
	var psizeNumber=20;
	var typeNumber=10;
	var totalPage=0;
	//课程列表选项卡切换
	var aTab=$("content-tab").getElementsByTagName('li');
	for (var i = 0; i < aTab.length; i++) {
		myAddEvent(aTab[i],"click",function(){
			for (var i = 0; i < aTab.length; i++) {
				aTab[i].className="";
			}
			this.className="tab-active";
			if (this.innerHTML=="产品设计") {
				typeNumber=10;
			}
			else{
				typeNumber=20;
			}
			pageClear();
			course();
		})
	}
	//课程列表清空
	function pageClear(){
		var aClass=document.getElementsByClassName("class-list");
		for (var i = aClass.length-1; i >=0; i--) {
			$("design").removeChild(aClass[i])
		}
	}
	//课程列表
	function course(){
		//请求信息
		var sendData={
			pageNo:pageNoNumber,
			psize:psizeNumber,
			type:typeNumber
		}
		AJAX("GET","http://study.163.com/webDev/couresByCategory.htm",sendData,
			function(str){
				var arr=JSON.parse(str);

				totalPage=arr["totalPage"];

				var list=arr["list"];
				
				for (i in list) {
					var classList = document.createElement("div");
	                classList.className = "class-list";
	                    //课程图片
	                var classListImg = document.createElement("img");
	                classListImg.src = list[i].middlePhotoUrl;
	                classListImg.alt = list[i].name;
	                //课程信息.文字信息包裹.
	                var classListContent = document.createElement("div");
	                classListContent.className = "describe";
	                //课程标题
	                var classListTitle = document.createElement("a");
	                var classListTitleTxt = document.createTextNode(list[i].name);
	                classListTitle.appendChild(classListTitleTxt);
	                classListTitle.href = list[i].providerLink;
	                //课程发布者
	                var classProvider = document.createElement("p");
	                var classProviderTxt = document.createTextNode(list[i].provider);
	                classProvider.appendChild(classProviderTxt);
	                //课程学习人数
	                var classPerson = document.createElement("div");
	                //人数图标
	                var hotPriceIcon = document.createElement("i");
	                hotPriceIcon.innerHTML = "&#xe603;";
	                hotPriceIcon.className = "iconfont";
	                classPerson.appendChild(hotPriceIcon);
	                var classPersonTxt = document.createTextNode(list[i].learnerCount);
	                classPerson.appendChild(classPersonTxt);
	                // 课程价格
	                var classPrice = document.createElement("strong");
	                if (list[i].price == "0") {
	                    var classPriceTxt = document.createTextNode("免费");
	                } 
	                else {
	                    var classPriceTxt = document.createTextNode(list[i].price);
	                    //价格图标..
	                    var classPriceIcon = document.createElement("i");
	                    classPriceIcon.innerHTML = "&#xe609;";
	                    classPriceIcon.className = "iconfont";
	                    classPrice.appendChild(classPriceIcon);
	                }
	                classPrice.appendChild(classPriceTxt);

	                //集体插入
	                $("design").appendChild(classList);
	                classList.appendChild(classListImg);
	                classList.appendChild(classListContent);
	                classListContent.appendChild(classListTitle);
	                classListContent.appendChild(classProvider);
	                classListContent.appendChild(classPerson);
	                classListContent.appendChild(classPrice);

	                var hoverDiv=document.createElement("div");
	                var hoverListTitle = document.createElement("a");
	                var hoverListTitleTxt = document.createTextNode(list[i].name);
	                hoverListTitle.appendChild(hoverListTitleTxt);
	                hoverListTitle.href = list[i].providerLink;
	                var hoverPerson = document.createElement("div");
	                //人数图标
	                var hotPriceIcon = document.createElement("i");
	                hotPriceIcon.innerHTML = "&#xe603;";
	                hotPriceIcon.className = "iconfont";
	                hoverPerson.appendChild(hotPriceIcon);
	                var hoverPersonTxt = document.createTextNode(list[i].learnerCount + "人在学");
	                hoverPerson.appendChild(hoverPersonTxt);
	                //课程发布者
	                var hoverProvider = document.createElement("p");
	                var hoverProviderTxt = document.createTextNode("发布者 ：" + list[i].provider);
	                hoverProvider.appendChild(hoverProviderTxt);
	                //分类
	                var hoverCategory = document.createElement("p");
	                if (list[i].categoryName==null) {
	                	list[i].categoryName="无"
	                }
	                var hoverCategoryTxt = document.createTextNode("分类 ：" + list[i].categoryName);
	                hoverCategory.appendChild(hoverCategoryTxt);
	                hoverDiv.appendChild(hoverListTitle);
	                hoverDiv.appendChild(hoverPerson);
	                hoverDiv.appendChild(hoverProvider);
	                hoverDiv.appendChild(hoverCategory);
	                hoverDiv.className = "describe-hover";
	                hoverDiv.style.display = "none";

	                //课程描述......
	                var hoverDescription = document.createElement("p");
	                var hoverDescriptionTxt = document.createTextNode(list[i].description);
	                hoverDescription.appendChild(hoverDescriptionTxt);
	                hoverDescription.className = "description";
	                hoverDescription.style.display = "none";

	                classList.appendChild(hoverDiv);
	                classList.appendChild(hoverDescription);
				}
	            var classlisthover = document.getElementsByClassName('class-list')
	            for (var i = 0; i < classlisthover.length; i++) {
	            	myAddEvent(classlisthover[i],"mouseover",function(){
	            		this.className="hover-class-list";
	            		this.getElementsByClassName('describe')[0].style.display="none";
	            		this.getElementsByClassName('describe-hover')[0].style.display="block";
	            		this.getElementsByClassName('description')[0].style.display="block";
	            	})
	            	myAddEvent(classlisthover[i],"mouseout",function(){
	            		this.className="class-list";
	            		this.getElementsByClassName('describe')[0].style.display="block";
	            		this.getElementsByClassName('describe-hover')[0].style.display="none";
	            		this.getElementsByClassName('description')[0].style.display="none";
	            	})
	       		}
			})
	}
	//翻页
	function pageChange(){
		var aLi=$("page-ul").getElementsByTagName("li");
		var preBtn=$("pagination").getElementsByTagName("i")[0];
		var nextBtn=$("pagination").getElementsByTagName("i")[1];

		//点击页数翻页
		for (var i = 0; i < aLi.length; i++) {
			myAddEvent(aLi[i],"click",function(){
				pageClear();
				for (var i = 0; i < aLi.length; i++) {
					aLi[i].className="";
				}
				this.className="page-active";
				pageNoNumber=this.innerHTML-0;
				course();
			})
		}
		
		//向前翻页
		myAddEvent(preBtn,"click",function(){
			if (pageNoNumber-1>=1) {
				pageNoNumber-=1;
				if (pageNoNumber%8==0) {
					for (var i = 0; i < aLi.length; i++) {
						aLi[i].innerHTML-=8;
					}
				}
			}
			else{
				return;
			}
			for (var i = 0; i < aLi.length; i++) {
				if (aLi[i].innerHTML==pageNoNumber) {
					aLi[i].className="page-active"
				}
				else{
					aLi[i].className="";
				}
			}
			pageClear();
			course();
		})

		//向后翻页
		myAddEvent(nextBtn,"click",function(){
			if (pageNoNumber+1<=totalPage) {
				pageNoNumber+=1;
				if (pageNoNumber%8==1) {
					for (var i = 0; i < aLi.length; i++) {
						aLi[i].innerHTML=aLi[i].innerHTML-0+8;
					}
				}
			}
			else{
				return;
			}
			pageClear();
			for (var i = 0; i < aLi.length; i++) {
				if (aLi[i].innerHTML==pageNoNumber) {
					aLi[i].className="page-active"
				}
				else{
					aLi[i].className="";
				}
			}
			course();
		})
	}
	course();
	pageChange()
}

//视频播放
function videoPlay(){
	myAddEvent($("studyMovie").getElementsByTagName('img')[0],"click",function(){
		$("movie-wrap").style.display="block";
	})
	myAddEvent($("movie-close"),"click",function(){
		$("movie-wrap").style.display="none";
	})
}

//最热排行
function hotRank(){
	AJAX("GET","http://study.163.com/webDev/hotcouresByCategory.htm",{},function(str){
			var arr=JSON.parse(str);
			var i = Math.round(Math.random() * 10);
	        var len = i + 10;
	        for (i; i < len; i++) {
	            //包裹层
	            var hotList = document.createElement("div");
	            hotList.className = "list-content";
	            hotList.className += " clearfix";
	            //左侧图片
	            var hotListImg = document.createElement("img");
	            hotListImg.src = arr[i].smallPhotoUrl;
	            hotListImg.alt = arr[i].name;
	            //标题
	            var hotListTitle = document.createElement("a");
	            hotListTitle.href = arr[i].providerLink;
	            var titleContent = document.createTextNode(arr[i].name);
	            hotListTitle.appendChild(titleContent);
	            //学习人数
	            var hotPrice = document.createElement("div");
	            var hotPriceContent = document.createTextNode(arr[i].price);
	            //图标
	            var hotPriceIcon = document.createElement("i");
	            hotPriceIcon.innerHTML = "&#xe603;";
	            hotPriceIcon.className = "iconfont";
	            hotPrice.appendChild(hotPriceIcon);
	            hotPrice.appendChild(hotPriceContent);
	            //插入页面
	            hotList.appendChild(hotListImg);
	            hotList.appendChild(hotListTitle);
	            hotList.appendChild(hotPrice);
	            $("ranking-list").appendChild(hotList);
			}
		})
	}


//初始化
window.onload=function(){
	topNotice();
	sliderInit();
	scrollInit();
	courseList();
	hotRank();
	signIn();
	videoPlay();
}