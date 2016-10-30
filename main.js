//工具函数
var $={
	//事件绑定
	myAddEvent:function(obj,name,fn){
		if (obj.addEventListener) {
			obj.addEventListener(name,fn,false);
		}
		else{
			obj.attachEvent("on"+name,fn);
		}
	},
	//数组排序函数
	resortX:function(a,b){
		return a.x-b.x;
	},
	resortY:function(a,b){
		return a.y-b.y;
	},
	//Cookie设定取得删除
	setCookie:function(name,value,expireDays){
		var exdate=new Date();
		exdate.setDate(exdate.getDate()+expireDays);
		document.cookie=name+"="+value+";expires="+exdate;
	},
	getCookie:function(name){
		var arr=document.cookie.split("; ")
		for (var i = 0; i < arr.length; i++) {
			var arr2=arr[i].split("=");
			if (arr2[0]==name) {
				return arr2[1];
			}
		}
		return "";
	},
	removeCookie:function(name){
		$.setCookie(name,0,-1)
	}
}
//基本参数
var Argument={
	blockLength:102,//方块宽高
	defalutBlockNum:2,//初始默认出现方块
	blockList:[],//方块数组
	moved:false,//操作后 是否有方块移动过 0表示未移动过 1表示移动过
	blockcolor:{
		num2:"#EEE4DA",
		num4:"#EDE0C8",
		num8:"#F2B179",
		num16:"#F59563",
		num32:"#F67C5F",
		num64:"#F65E3B",
		num128:"#EDCF72",
		num256:"#EDCC61",
		num512:"#EDC850",
		num1024:"#EDC53F",
		num2048:"#ECC400"
	},//方块颜色数组
	score:0,//当前分数
	bestScore:$.getCookie("bestScore"),//最高分数
	blockCount:0,//当前方块数量
	gameOverd:false,//游戏是否已失败
	canKeydown:true//是否允许键盘按下
}
//初始化
window.onload=function(){
	//背景
	for (var i = 0; i < 16; i++) {
		var newnode=document.createElement("div");
		newnode.className="back-block"
		document.getElementById('main').appendChild(newnode);
	}
	//newgame 按钮事件绑定
	$.myAddEvent(document.getElementById('newgame'),"click",gameSystem.newGame)
	gameSystem.newGame();
}
//事件触发

$.myAddEvent(window,"keydown",function(){
	function onKeyDown(ev){
		var oEvent=ev||event||window.event;
		if (Argument.canKeydown==false) {
			return;
		}
		var timer=null,direction="";
		//初始化数据
		Argument.moved=false;
		Argument.canKeydown=false;
		//判断按键方向 并根据方向排序数组
		switch(oEvent.keyCode){
			case 37:direction="left";Argument.blockList.sort($.resortX);break;
			case 38:direction="up";Argument.blockList.sort($.resortY);break;
			case 39:direction="right";Argument.blockList.sort($.resortX).reverse();break;
			case 40:direction="down";Argument.blockList.sort($.resortY).reverse();break;
			default:Argument.canKeydown=true;return;
		}
		//遍历数组 给每个方块下达命令
		for (var i = 0; i < Argument.blockList.length; i++) {
			if (Argument.blockList[i].x<0) {
				continue;
			}
			else{
				Argument.blockList[i].combined=0;
				Argument.blockList[i].commander(direction);
			}
		}
		//如果移动过则 创建一个新的方块 检测是否游戏结束
		if (Argument.moved) {
			timer=setTimeout(function(){
				Argument.canKeydown=true;
				gameSystem.blockObjCreate();
				gameSystem.gameOver();
			},200)
		}
		if (Argument.moved==false) {
			Argument.canKeydown=true;
		}
	}
	onKeyDown();
})

//游戏系统
var gameSystem={
	//开始新游戏
	newGame:function(){
		//删除场上所有方块
		for (var i = 0; i < Argument.blockList.length; i++) {
			if (Argument.blockList[i].x!==-1) {
				Argument.blockList[i].ele.parentNode.removeChild(Argument.blockList[i].ele)
			}
		}
		//一系列数据初始化
		gameSystem.scorePad(0)
		Argument.gameOverd=false;
		Argument.blockList=[];
		Argument.blockCount=0;
		//初始默认方块
		for (var j = 0; j < Argument.defalutBlockNum; j++) {
			gameSystem.blockObjCreate();
		}
	},
	//游戏结束判断
	gameOver:function(){
		var combineable=false;
		var timer=null;
		//若游戏已经结束 则不作任何操作
		if (Argument.gameOverd==true) {
			return;
		}
		//当场上方块数量最大时 开始判断是否游戏结束
		if (Argument.blockCount==16) {
			for (var i = 0; i < Argument.blockList.length; i++) {
				var me=Argument.blockList[i];
				if (me.x==-1) {
					continue;
				}
				if (me.pathCheck(me.x+Argument.blockLength,me.y)!=="keep"||me.pathCheck(me.x-Argument.blockLength,me.y)!=="keep"||me.pathCheck(me.x,me.y+Argument.blockLength)!=="keep"||me.pathCheck(me.x,me.y-Argument.blockLength)!=="keep") {
					combineable=true;
					return;
				}
			}
			//若没有可合并的方块 则游戏结束并发出提示
			if (combineable==false) {
				Argument.gameOverd=true;
				timer=setTimeout(function(){
					alert("你输了 你的成绩是 "+Argument.score+"分")
				},500)
			}
		}
	},
	//计分板 参数point为得到的分数 point为0时 清空计分板
	scorePad:function(point){
		Argument.score+=point;
		if(point==0){
			Argument.score=0;
		}
		//当前分数大于最高分数时 同步最高分数
		if (Argument.score>=Argument.bestScore||Argument.bestScore=="") {
			Argument.bestScore=Argument.score;
			$.setCookie("bestScore",Argument.bestScore,30)
		}
		document.getElementById('total').getElementsByTagName('span')[0].innerHTML=Argument.score;
		document.getElementById('best').getElementsByTagName('span')[0].innerHTML=Argument.bestScore;
	},
	//方块创建
	blockObjCreate:function(){
		var nBlock=new block();
		Argument.blockList.push(nBlock);
		Argument.blockCount+=1;
		nBlock.createBlock();
	}
}
//方块对象构造函数
var block=function(){
	this.ele=undefined;//DOM元素
	this.x=1;//left值
	this.y=1;//top值
	this.num=0;//数字
	this.combined=0;//操作后 是否合并过 0表示未合并过 1表示合并过
}
//创建DOM元素
block.prototype.createBlock=function(){
	//随机坐标
	var lf=Math.round(Math.random()*3)*Argument.blockLength;
	var tp=Math.round(Math.random()*3)*Argument.blockLength;
	//遍历数组 如果有坐标重合 则重新调用自身 直到无重合为止
	for (var i = 0; i < Argument.blockList.length; i++) {
		if (Argument.blockList[i].x==lf&&Argument.blockList[i].y==tp) {
			this.createBlock();
			return;
		}
	}
	//DOM元素创建 插入 以及样式属性添加
	var newnode=document.createElement("div");
	var num=[2,4][Math.round(Math.random()*1)]
	newnode.innerHTML=num;
	newnode.className="block";
	newnode.style.left=lf+"px";
	newnode.style.top=tp+"px";
	this.ele=newnode;
	this.num=num;
	this.x=lf;
	this.y=tp;
	newnode.style.background=Argument.blockcolor["num"+this.num]
	document.getElementById('main').appendChild(newnode);
}
//命令自身下一步的行动 参数direction为方向
block.prototype.commander=function(direction){
	var self=this;
	var x=0,y=0;
	//根据方向 判断下一步的目标坐标
	switch(direction){
		case "left": x=self.x-Argument.blockLength;y=self.y;break;
		case "right":x=self.x+Argument.blockLength;y=self.y;break;
		case "up":x=self.x;y=self.y-Argument.blockLength;break;
		case "down":x=self.x;y=self.y+Argument.blockLength;break;
	}
	//检测目标坐标可以执行的操作
	//移动
	if (self.pathCheck(x,y)=="move") {
		self.move(x,y);
		self.commander(direction);
	}
	//合并
	else if (self.pathCheck(x,y)=="combine") {
		self.move(x,y)
		self.combine();
		self.commander(direction);
	}
	//保持现状
	else if (self.pathCheck(x,y)=="keep"||self.pathCheck(x,y)=="notOver") {
		return;
	}
}
//路线检测函数 参数x y为目标坐标
block.prototype.pathCheck=function(x,y){
	var self=this;
	//在范围内
	if (x>=0&&x<=306&&y>=0&&y<=306) {
		for (var i = 0; i < Argument.blockList.length; i++) {
			//有块
			if (Argument.blockList[i].x==x&&Argument.blockList[i].y==y) {
				//不能合并
				if (Argument.blockList[i].num!==self.num) {
					return "keep";
				}
				//可以合并
				else if (self.combined==0&&Argument.blockList[i].combined==0&&Argument.blockList[i].num==self.num){
					return "combine";
				}
				//合并过一次 但仍然存在合并可能 游戏未结束
				else if (self.combined==1||Argument.blockList[i].combined==1) {
					return "notOver";
				}
			}
		}
		//无块
		return "move"
	}
	//超出范围
	else{
		return "keep";
	}
}
//移动函数 参数x y为目标坐标
block.prototype.move=function(x,y){
	Argument.moved=true;
	this.x=x;
	this.y=y;
	this.ele.style.left=this.x+"px";
	this.ele.style.top=this.y+"px";
}
//合并
block.prototype.combine=function(){
	var self=this;
	//遍历数组找到合并目标并删除
	for (var i = 0; i < Argument.blockList.length; i++) {
		if (Argument.blockList[i].x==self.x&&Argument.blockList[i].y==self.y&&Argument.blockList[i].num==self.num&&Argument.blockList[i]!==self) {
			Argument.blockList[i].ele.parentNode.removeChild(Argument.blockList[i].ele);
			Argument.blockList[i].x=-1;
			Argument.blockList[i].y=-1;
			break;
		}
	}
	//合并后一系列变化
	self.num=self.num*2;
	self.ele.innerHTML=self.num;
	self.ele.style.background=Argument.blockcolor["num"+this.num]
	self.combined=1;
	Argument.blockCount-=1;
	gameSystem.scorePad(self.num)
}		
