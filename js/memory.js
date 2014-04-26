//模拟内存
(function() {
	var memory = function() {
		//内存初始化，16位
		this.addr = new Array();
		this.initialMemory = function()
		{
			for(var i = 0 ; i < 0xffff ; i++)
			{
				this.addr[i] = "00";
			}
		}
		//取指令并且将指令剖开成地址和指令两部分
		this.splitInstructor = function ( src, p )
		{
			var p1 = src.indexOf(":");
			var p2 = src.indexOf("|");
			if ( p1 != -1 ) {
				p.addr = src.substring(0,p1);
				p.ins = src.substring(p1+1,p2);
				p.addr = p.addr.replace( /^\s+|\s+$/g,"" );
				p.ins = p.ins.replace( /^\s+|\s+$/g,"" );
				return 1;
			};
			return 0;
		}
		//将指令加载入模拟内存当中
		this.parseInstructor = function(asmIns)
		{
			var flag;
			function para (addr, ins) {
				this.addr = addr;
				this.ins = ins;
			}
			p = new para(null,null);
			var lines = asmIns.split("\n");
			for (var lineNum = 0 ; lineNum < lines.length ; lineNum++) 
			{
				flag = window.VM.Memory.splitInstructor(lines[lineNum],p);
				if (flag) {
					//window.VM.Memory.addr[parseInt(p.addr)] = p.ins;
					for(var curPos = 0 , index = 0; curPos+2 <= p.ins.length ; curPos = curPos + 2 , index++)
					{
						window.VM.Memory.addr[parseInt(p.addr)+index] = p.ins.substring(curPos,curPos+2);
					}
				};
			};
		};
		//获取指定地址后的指定字节数
		this.readBytes = function( addr , numOfBytes )
		{
			var bytes = "";
			for(var num = 0 ; num < numOfBytes ; num++)
			{
				bytes += window.VM.Memory.addr[addr+num];
			}
			return bytes;
		}
		//向指定内存地址addr中写4个字节的数，不够4字节补全
		this.writeBytes = function( addr , num )
		{
			var negFlag = 0;
			//二进制数转十六进制
			function binMap2hex (num) {
				var hex="";
				for (var i = 0 ; i < 8 ; i++){
					switch(num.substring(4*i,4*i+4))
					{
						case "0000" : hex += "0";break;
						case "0001" : hex += "1";break;
						case "0010" : hex += "2";break;
						case "0011" : hex += "3";break;
						case "0100" : hex += "4";break;
						case "0101" : hex += "5";break;
						case "0110" : hex += "6";break;
						case "0111" : hex += "7";break;
						case "1000" : hex += "8";break;
						case "1001" : hex += "9";break;
						case "1010" : hex += "a";break;
						case "1011" : hex += "b";break;
						case "1100" : hex += "c";break;
						case "1101" : hex += "d";break;
						case "1110" : hex += "e";break;
						case "1111" : hex += "f";break;
					}
				}
				return hex;
			}
			//dec->bin
			var binNum;
			if (num < 0) {
				num += 1;
				num = -num;
				binNum = num.toString(2);
				negFlag = 1;
			}
			else
				binNum = num.toString(2);
			//补成32位
			if(binNum.length < 32){
				for (var i = 32 - binNum.length ; i > 0 ; i--){
					binNum = "0" + binNum;
				}
			}
			if (negFlag == 1) {
				//取反加1
				var temp="";
				for (var i = 0; i < 32 ; i++) {
					if (binNum.substring(i,i+1) == "0") {
						temp += "1";
					}
					else{
						temp += "0";
					}
				};
				binNum = temp;
			};
			//bin->hex
			var hexNum = binMap2hex(binNum);
			//倒转存储
			window.VM.Memory.addr[addr]   = hexNum.substring(6,8);
			window.VM.Memory.addr[addr+1] = hexNum.substring(4,6);
			window.VM.Memory.addr[addr+2] = hexNum.substring(2,4);
			window.VM.Memory.addr[addr+3] = hexNum.substring(0,2);
			//t = "";
			//t += hexNum.substring(6,8);
			//t += hexNum.substring(4,6);
			//t += hexNum.substring(2,4);
			//t += hexNum.substring(0,2);
			//return t;
		}
	};
	window.buildMemory = memory;

})();