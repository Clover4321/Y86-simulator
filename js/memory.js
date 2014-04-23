//模拟内存
(function() {
	var memory = function() {
		//内存初始化，16位
		this.addr = new Array();
		this.initialMemory = function()
		{
			for(var i = 0 ; i < 0xffff ; i++)
			{
				this.addr[i] = 0;
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
		this.getBytes = function( addr , numOfBytes )
		{
			var bytes = "";
			for(var num = 0 ; num < numOfBytes ; num++)
			{
				bytes += window.VM.Memory.addr[addr+num];
			}
			return bytes;
		}
	};
	window.buildMemory = memory;

})();