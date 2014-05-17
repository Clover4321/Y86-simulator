(function () {
	
	window.output = "";
	window.CPI_cycle = new Array();
	window.CPI_value = new Array();

	//指令宏定义
	var INOP = 0;
	var IHALT = 1;
	var IRRMOVL = 2;
	var IIRMOVL = 3;
	var IRMMOVL = 4;
	var IMRMOVL = 5;
	var IOPL = 6;
	var IJXX = 7;
	var ICALL = 8;
	var IRET = 9;
	var IPUSHL = 0xA;
	var IPOPL = 0xB;
	var RNONE = 8;
	var ALUADD = 0;

	var SNOR = 0;
	var SHLT = 1;


	//跳转类型宏定义
	var IJMP = 0;
	var IJLE = 1;
	var IJL = 2;
	var IJE = 3;
	var IJNE = 4;
	var IJGE = 5;
	var IJG = 6;

	//寄存器宏定义
	var REAX = 0;
	var RECX = 1;
	var REDX = 2;
	var REBX = 3;
	var RESP = 4;
	var REBP = 5;
	var RESI = 6;
	var REDI = 7;
	var RZF = 0xC;
	var RSF = 0xD;
	var ROF = 0xE;

	//CPI:Instruction Frequency
	var count_total_ins=0
	var count_mrmovl=0;
	var count_popl=0;
	var count_cond_branch=0;
	var count_ret=0;

	//CPI:Condition Frequency
	var count_loan_use=0;
	var count_mispredict=0;

	//Fetch寄存器
	function positionF( )
	{

	}
	positionF.prototype={
		nop_state : function()
		{
			this.state = SNOR;
		},
		set_predPC : function( predPC )
		{
			this.predPC = predPC;
		},
		set_state : function( state )
		{
			this.state = state;
		},
		toString : function()
		{
			var info = "Fetch:\n"+
						"F_predPC = 0x"+this.predPC.toString(16)+'\n';
			$("#F_predPC").html("0x"+this.predPC.toString(16));
			return info;
		}
	}

	//Decode寄存器
	function positionD()
	{

	}
	positionD.prototype={
		nop_state : function()
		{
			this.icode = 0;
			this.ifun = 0;
			this.state = SNOR;
			//this.rA = RNONE;
			//this.rb = RNONE;
		},
		set_state : function( state )
		{
			this.state = state;
		},
		set_icode : function( icode )
		{
			this.icode = icode;
		},
		set_ifun : function( ifun )
		{
			this.ifun = ifun;
		},
		set_rA : function( rA )
		{
			this.rA = rA;
		},
		set_rB : function( rB )
		{
			this.rB = rB;
		},
		set_ValC : function( ValC )
		{
			this.ValC = ValC;
		},
		set_ValP : function( ValP )
		{
			this.ValP = ValP;
		},
		toString : function()
		{
			var info =	"DECODE:"+'\n'+
						"D_icode = 0x"+this.icode.toString(16)+'\n'+
						"D_ifun = 0x"+this.ifun.toString(16)+'\n'+
						"D_rA = 0x"+this.rA.toString(16)+'\n'+
						"D_rB = 0x"+this.rB.toString(16)+'\n'+
						"D_ValC = 0x"+this.ValC.toString(16)+'\n'+
						"D_ValP = 0x"+this.ValP.toString(16)+'\n';
			$("#D_icode").html("0x"+this.icode.toString(16));
			$("#D_ifun").html("0x"+this.ifun.toString(16));
			$("#D_rA").html("0x"+this.rA.toString(16));
			$("#D_rB").html("0x"+this.rB.toString(16));
			$("#D_ValC").html("0x"+this.ValC.toString(16));
			$("#D_ValP").html("0x"+this.ValP.toString(16));
			return info;
		}
	}

	//Execute寄存器
	function positionE()
	{

	}
	positionE.prototype={
		nop_state : function()
		{
			this.icode = 0;
			this.ifun = 0;
			this.dstM = RNONE;
			this.dstE = RNONE;
			this.d_srcB = RNONE;
			this.d_srcA = RNONE;
			this.state = SNOR;
		},
		set_state : function( state )
		{
			this.state = state;
		},
		set_icode : function( icode )
		{
			this.icode = icode;
		},
		set_ifun : function( ifun )
		{
			this.ifun = ifun;
		},
		set_ValC : function( ValC )
		{
			this.ValC = ValC;
		},
		set_ValA : function( ValA )
		{
			this.ValA = ValA;
		},
		set_ValB : function( ValB )
		{
			this.ValB = ValB;
		},
		set_dstE : function( dstE )
		{
			this.dstE = dstE;
		},
		set_dstM : function( dstM )
		{
			this.dstM = dstM;
		},
		set_srcA : function( srcA )
		{
			this.srcA = srcA;
		},
		set_srcB : function( srcB )
		{
			this.srcB = srcB;
		},
		toString : function()
		{
			var info = "EXECUTE:"+'\n'+
						"E_icode = 0x"+this.icode.toString(16)+'\n'+
						"E_ifun = 0x"+this.ifun.toString(16)+'\n'+
						"E_ValC = 0x"+this.ValC.toString(16)+'\n'+
						"E_ValA = 0x"+this.ValA.toString(16)+'\n'+
						"E_ValB = 0x"+this.ValB.toString(16)+'\n'+
						"E_dstE = 0x"+this.dstE.toString(16)+'\n'+
						"E_dstM = 0x"+this.dstM.toString(16)+'\n'+
						"E_srcA = 0x"+this.srcA.toString(16)+'\n'+
						"E_srcB = 0x"+this.srcB.toString(16)+'\n'
						;
			$("#E_icode").html("0x"+this.icode.toString(16));
			$('#E_ifun').html("0x"+this.ifun.toString(16));
			$("#E_ValC").html("0x"+this.ValC.toString(16));
			$("#E_ValA").html("0x"+this.ValA.toString(16));
			$("#E_ValB").html("0x"+this.ValB.toString(16));
			$("#E_dstE").html("0x"+this.dstE.toString(16));
			$("#E_dstM").html("0x"+this.dstM.toString(16));
			$("#E_srcA").html("0x"+this.srcA.toString(16));
			$("#E_srcB").html("0x"+this.srcB.toString(16));
			return info;
		}
	}

	//Memory寄存器
	function positionM()
	{

	}
	positionM.prototype={
		nop_state : function()
		{
			this.icode = 0;
			this.dstE = RNONE;
			this.dstM = RNONE;
			this.Bch = false;
			this.state = SNOR;
		},
		set_state : function( state )
		{
			this.state = state;
		},
		set_icode : function( icode )
		{
			this.icode = icode;
		},
		set_Bch : function( Bch )
		{
			this.Bch = Bch;
		},
		set_ValE : function( ValE )
		{
			this.ValE = ValE;
		},
		set_ValA : function( ValA )
		{
			this.ValA = ValA;
		},
		set_dstE : function( dstE )
		{
			this.dstE = dstE;
		},
		set_dstM : function( dstM )
		{
			this.dstM = dstM;
		},
		toString : function()
		{
			var info = "Memory:\n"+
						"M_icode = 0x"+this.icode.toString(16)+'\n'+
						"M_Bch = "+this.Bch.toString()+'\n'+
						"M_ValE = 0x"+this.ValE.toString(16)+'\n'+
						"M_ValA = 0x"+this.ValA.toString(16)+'\n'+
						"M_dstE = 0x"+this.dstE.toString(16)+'\n'+
						"M_dstM = 0x"+this.dstM.toString(16)+'\n';
			$("#M_icode").html("0x"+this.icode.toString(16));
			$("#M_Bch").html(this.Bch.toString());
			$("#M_ValE").html("0x"+this.ValE.toString(16));
			$("#M_ValA").html("0x"+this.ValA.toString(16));
			$("#M_dstE").html("0x"+this.dstE.toString(16));
			$("#M_dstM").html("0x"+this.dstM.toString(16));
			return info;
		}
	}

	//WriteBack寄存器
	function positionW()
	{

	}
	positionW.prototype={
		nop_state : function()
		{
			this.icode = 0;
			this.dstE = RNONE;
			this.dstM = RNONE;
			this.state = SNOR;
		},
		set_state : function( state )
		{
			this.state = state;
		},
		set_icode : function( icode )
		{
			this.icode = icode;
		},
		set_ValE : function( ValE )
		{
			this.ValE = ValE;
		},
		set_ValM : function( ValM )
		{
			this.ValM = ValM;
		},
		set_dstE : function( dstE )
		{
			this.dstE = dstE;
		},
		set_dstM: function( dstM )
		{
			this.dstM = dstM;
		},
		toString : function()
		{
			var info = "WriteBack:\n"+
						"W_icode = 0x"+this.icode.toString(16)+'\n'+
						"W_ValE = 0x"+this.ValE.toString(16)+'\n'+
						"W_ValM = 0x"+this.ValM.toString(16)+'\n'+
						"W_dstE = 0x"+this.dstE.toString(16)+'\n'+
						"W_dstM = 0x"+this.dstM.toString(16)+'\n';
			$("#W_icode").html("0x"+this.icode.toString(16));
			$("#W_ValE").html("0x"+this.ValE.toString(16));
			$("#W_ValM").html("0x"+this.ValM.toString(16));
			$("#W_dstE").html("0x"+this.dstE.toString(16));
			$("#W_dstM").html("0x"+this.dstM.toString(16));
			return info;
		}
	}

	//执行Fetch
	function executeF( addr, reg )
	{
		this.addr = addr;
		this.reg = reg;
	}
	executeF.prototype=
	{
		execute : function( F, D, newF, SPC )
		{
			count_total_ins++;
			D.set_state(F.state);
			newF.set_state(F.state);
			SPC.set_F_predPC( F.predPC );
			var f_pc = SPC.select();
			var B1 = this.addr.readBytes(f_pc,1);
			var B2 = this.addr.readBytes(f_pc+1,1);
			var B3 = this.addr.readBytes(f_pc+2,4);
			var B4 = this.addr.readBytes(f_pc+1,4);
			//document.write( "0x"+f_pc.toString(16) );
			$("#F_predPC").html("0x"+f_pc.toString(16));
			D.set_icode( Number("0x"+B1[0]) );
			D.set_ifun( Number("0x"+B1[1]) );
			D.set_rA(RNONE);
			D.set_rB(RNONE);
			var nextPC;
			switch( D.icode )
			{
				case INOP:
					nextPC = f_pc+1;
					break;
				case IHALT:
					nextPC = f_pc+1;
					D.set_state( SHLT );
					break;
				case IRET:
					//D.set_rA( Number("0x"+B2[0]) );
					//D.set_rB( Number("0x"+B2[1]) );
					nextPC = f_pc+1;
					count_ret++;
					break;

				case IRRMOVL:
					D.set_rA( Number("0x"+B2[0]) );
					D.set_rB( Number("0x"+B2[1]) );
					nextPC = f_pc+2;
					break;
				case IOPL:
					D.set_rA( Number("0x"+B2[0]) );
					D.set_rB( Number("0x"+B2[1]) );
					nextPC = f_pc+2;
					break;
				case IPUSHL:
					D.set_rA( Number("0x"+B2[0]) );
					D.set_rB( Number("0x"+B2[1]) );
					nextPC = f_pc+2;
					break;
				case IPOPL:
					D.set_rA( Number("0x"+B2[0]) );
					D.set_rB( Number("0x"+B2[1]) );
					nextPC = f_pc+2;
					count_popl++;
					break;

				case IIRMOVL:
					var nor = LittleEnd2Normal( B3 );
					D.set_ValC( Number("0x"+nor) );
					D.set_rA( Number("0x"+B2[0]) );
					D.set_rB( Number("0x"+B2[1]) );
					nextPC = f_pc+6;
					break;
				case IRMMOVL:
					var nor = LittleEnd2Normal( B3 );
					D.set_ValC( Number("0x"+nor) );
					D.set_rA( Number("0x"+B2[0]) );
					D.set_rB( Number("0x"+B2[1]) );
					nextPC = f_pc+6;
					break;
				case IMRMOVL:
					var nor = LittleEnd2Normal( B3 );
					D.set_ValC( Number("0x"+nor) );
					D.set_rA( Number("0x"+B2[0]) );
					D.set_rB( Number("0x"+B2[1]) );
					nextPC = f_pc+6;
					count_mrmovl++;
					break;

				case IJXX:
					var nor = LittleEnd2Normal( B4 );
					D.set_ValC( Number("0x"+nor) );
					//D.set_rA( Number("0x"+B2[]) );
					//D.set_rB( Number("0x"+ins[3]) );
					D.set_rA(RNONE);
					D.set_rB(RNONE);
					nextPC = f_pc+5;
					count_cond_branch++;
					break;
				case ICALL:
					var nor = LittleEnd2Normal( B4 );
					D.set_ValC( Number("0x"+nor) );
					//D.set_rA( Number("0x"+ins[2]) );
					//D.set_rB( Number("0x"+ins[3]) );
					D.set_rA(RNONE);
					D.set_rB(RNONE);
					nextPC = f_pc+5;
					break;
				default:
					D.set_state(SHLT);
					break;
			}
			D.set_ValP( nextPC );
			var PPC = new PredictPC();
			PPC.set_f_icode( D.icode );
			PPC.set_f_ValC( D.ValC );
			PPC.set_f_ValP( D.ValP );
			newF.set_predPC( PPC.predict() );
		}
	}

	//执行Decode
	function executeD( addr, reg )
	{
		this.addr = addr;
		this.reg = reg;
	}
	executeD.prototype={
		execute : function(D,E,FB,SFA,PCL)
		{
			E.set_state(D.state);
			E.set_icode( D.icode );
			E.set_ifun( D.ifun );
			E.ValC = D.ValC;
			E.set_dstE( RNONE );
			E.set_dstM( RNONE );
			E.set_srcA( RNONE );
			E.set_srcB( RNONE );

			switch( E.icode )
			{
				case IRRMOVL:
					E.set_dstE( D.rB );
					E.set_srcA( D.rA );
					if( E.ifun == 0 )
					{
						E.set_ValA( this.reg[D.rA] );
						E.set_ValB( 0 );
					}
					else
					{
						E.set_ValA( this.reg[D.rA] );
						E.set_ValB( 0 );
					}
				break;

				case INOP:
					//E.set_ValA( 0 );
					E.set_ValB( 0 );
					break;
				case IHALT:
					//E.set_ValA( 0 );
					E.set_ValB( 0 );
					break;
				case IIRMOVL:
					E.set_dstE( D.rB );
					E.set_ValB( 0 );
					break;
				case IJXX:
					E.set_ValA( D.ValP );
					E.set_ValB( 0 );
					break;

				case IMRMOVL:
					E.set_dstM( D.rA );
					E.set_srcB( D.rB );
					E.set_ValB( this.reg[D.rB] );
					break;

				case IRMMOVL:
					E.set_srcB( D.rB );
					E.set_srcA( D.rA );
					E.set_ValA( this.reg[D.rA] );
					E.set_ValB( this.reg[D.rB] );
					break;
				case IOPL:
					E.set_srcB( D.rB );
					E.set_dstE( D.rB );
					E.set_srcA( D.rA );
					E.set_ValA( this.reg[D.rA] );
					E.set_ValB( this.reg[D.rB] );
					break;

				case ICALL:
					E.set_srcB( RESP );
					E.set_dstE( RESP );
					E.set_ValA( D.ValP );
					E.set_ValB( this.reg[RESP] );
					break;

				case IRET:
					E.set_srcB( RESP );
					E.set_dstE( RESP );
					E.set_srcA( RESP );
					E.set_ValA( this.reg[RESP] );
					E.set_ValB( this.reg[RESP] );
					break;
				case IPOPL:
					E.set_dstM( D.rA );
					E.set_srcB( RESP );
					E.set_dstE( RESP );
					E.set_srcA( RESP );
					E.set_ValA( this.reg[RESP] );
					E.set_ValB( this.reg[RESP] );
					break;

				case IPUSHL:
					E.set_srcB( RESP );
					E.set_dstE( RESP );
					E.set_srcA( D.rA );
					E.set_ValA( this.reg[D.rA] );
					E.set_ValB( this.reg[RESP] );
					break;
			}

			FB.set_d_srcB( E.srcB );
			FB.set_d_rvalB( E.ValB );
			E.set_ValB( FB.forwardB() );

			SFA.set_d_srcA( E.srcA );
			SFA.set_d_rvalA( E.ValA );
			SFA.set_D_icode( D.icode );
			SFA.set_D_ValP( D.ValP );
			E.set_ValA( SFA.select_forwardA() );

			PCL.set_D_icode( D.icode );
			PCL.set_d_srcA( E.srcA );
			PCL.set_d_srcB( E.srcB );
		}
	}

	//执行Execute
	function executeE( addr, reg )
	{
		this.addr = addr;
		this.reg = reg;
	}
	executeE.prototype={
		execute : function( E,M,FB,SFA,PCL )
		{
			M.set_state(E.state);
			M.set_icode( E.icode ); 
			M.set_ValA( E.ValA );
			M.set_dstE( E.dstE );
			M.set_dstM( E.dstM );
			switch( E.icode )
			{
				case INOP:
				case IHALT:
					M.Bch = false;
					M.ValE = 0;
					break;

				case IRRMOVL:
					if( E.ifun == 0 )
					{
						M.Bch = false;
						M.set_ValE( E.ValA );

					}
					else
					{
						M.Bch = false;
						var flag;
						switch( E.ifun )
						{
							case IJLE:
								flag = (this.reg[RSF] != this.reg[ROF]) || this.reg[RZF];
								break;
							case IJL:
								flag = this.reg[RSF] != this.reg[ROF];
								break;
							case IJE:
								flag = this.reg[RZF];
								break;
							case IJNE:
								flag = !this.reg[RZF];
								break;
							case IJGE:
								flag = !(this.reg[RSF]!=this.reg[ROF]);
								break;
							case IJG:
								flag = !(this.reg[RSF]^this.reg[ROF])&&!this.reg[RZF];
								break;
						}
						M.dstE = flag ? D.rB : RNONE;
						M.ValE = 0;
					}
					break;

				case IIRMOVL:
					M.Bch = false;
					M.ValE = E.ValC;
					break;

				case IRMMOVL:
				case IMRMOVL:
					M.Bch = false;
					M.ValE = E.ValB+E.ValC;
					break;

				case IOPL:
					M.Bch = false;
					switch( E.ifun )
					{
					case 0:
						var a = E.ValB;
						var b = E.ValA;
						if( a>0xfffffff )
						{
							a = -1*(~a+1);
						}
						if( b>0xfffffff )
						{
							b = -1*(~b+1);
						}
						M.ValE = a+b;
						var t = M.ValE;
						this.reg[ROF] = ( a < 0 == b < 0 ) && ( t < 0 != a < 0 );
						break;
					case 1:
						M.ValE = E.ValB-E.ValA;
						var a = E.ValB;
						var b = E.ValA;
						if( a>0xfffffff )
						{
							a = -1*(~a+1);
						}
						if( b>0xfffffff )
						{
							b = -1*(~b+1);
						}
						var t = a-b;
						M.ValE = t;
						this.reg[ROF] = ( a < 0 == b < 0 ) && ( t < 0 != a < 0 );
						break;
					case 2:
						M.ValE = E.ValB&E.ValA;
						break;
					case 3:
						M.ValE = E.ValB^E.ValA;
						break;
					}
					this.reg[RSF] = M.ValE < 0 ? true : false;
					this.reg[RZF] = M.ValE == 0 ? true : false;

				break;

				case IJXX:
					switch( E.ifun )
					{
						case IJMP:
							M.Bch = true;
							break;
						case IJLE:
							M.Bch = (this.reg[RSF]!=this.reg[ROF])||this.reg[RZF];
							break;
						case IJL:
							M.Bch = this.reg[RSF]!=this.reg[ROF];
							break;
						case IJE:
							M.Bch = this.reg[RZF];
							break;
						case IJNE:
							M.Bch = !this.reg[RZF];
							break;
						case IJGE:
							M.Bch = !(this.reg[RSF]!=this.reg[ROF]);
							break;
						case IJG:
							M.Bch = !(this.reg[RSF]!=this.reg[ROF])&&!this.reg[RZF];
							break;

					}
					M.ValE = 0;
				break;

				case IPUSHL:
				case ICALL:
					M.Bch = false;
					M.ValE = E.ValB-4;
				break;

				case IPOPL:
				case IRET:
					M.Bch = false;
					M.ValE = E.ValB+4;
				break;

			}
			FB.set_E_dstE( E.dstE );
			FB.set_e_ValE( M.ValE );
			SFA.set_E_dstE( E.dstE );
			SFA.set_e_ValE( M.ValE );

			PCL.set_E_dstM( E.dstM );
			PCL.set_E_icode( E.icode );
			PCL.set_e_Bch( M.Bch );
		}
	}

	//执行Memory
	function executeM( addr, reg )
	{
		this.addr = addr;
		this.reg = reg;
	}
	executeM.prototype={
		execute : function( M, W, SPC,FB,SFA,PCL )
		{
			W.set_state( M.state );
			W.set_icode( M.icode );
			W.set_dstE( M.dstE );
			W.set_dstM( M.dstM );
			W.set_ValE( M.ValE );
			W.set_ValM( 0 );
			switch( W.icode )
			{
				case INOP:
				break;
				
				case IHALT:
				break;

				case IRRMOVL:
				break;

				case IIRMOVL:

					break;

				case IRMMOVL:
					//this.addr[M.ValE] = M.ValA;
					this.addr.writeBytes(M.ValE,M.ValA);
					break;
				case IMRMOVL:
					//W.set_ValM( this.addr[M.ValE] );
					var raw = this.addr.readBytes(M.ValE,4);
					var nor = LittleEnd2Normal(raw);
					W.set_ValM( Number("0x"+nor) );
					break;

				case IOPL:
				break;

				case IJXX:
				break;

				case ICALL:
					//this.addr[M.ValE] = M.ValA;
					this.addr.writeBytes(M.ValE,M.ValA);
					break;

				case IRET:
					var raw = this.addr.readBytes(M.ValA,4);
					var nor = LittleEnd2Normal(raw);
					W.set_ValM( Number("0x"+nor) );
					break;

				case IPUSHL:
					//this.addr[M.ValE] = M.ValA;
					this.addr.writeBytes(M.ValE,M.ValA);
					break;

				case IPOPL:
					//W.ValM = this.addr[M.ValA];
					var raw = this.addr.readBytes(M.ValA,4);
					var nor = LittleEnd2Normal(raw);					
					W.set_ValM( Number("0x"+nor) );
					break;

			}

			SPC.set_M_Bch( M.Bch );
			SPC.set_M_icode( M.icode );
			SPC.set_M_ValA( M.ValA );

			FB.set_M_dstE( M.dstE );
			FB.set_M_dstM( M.dstM );
			FB.set_M_ValE( M.ValE );
			FB.set_m_ValM( W.ValM );

			SFA.set_M_dstE( M.dstE );
			SFA.set_M_dstM( M.dstM );
			SFA.set_M_ValE( M.ValE );
			SFA.set_m_ValM( W.ValM );

			PCL.set_M_icode( M.icode );
		}
	}

	//执行WriteBack
	function executeW( addr, reg )
	{
		this.addr = addr;
		this.reg = reg;
	}
	executeW.prototype={
		execute : function( W, SPC,FB,SFA )
		{
			switch( W.icode )
			{
				case INOP:
				break;
				
				case IHALT:
				break;

				case IRRMOVL:
					this.reg[W.dstE] = W.ValE;
				break;

				case IIRMOVL:
					this.reg[W.dstE] = W.ValE;
					break;

				case IRMMOVL:
					break;
				case IMRMOVL:
					//var nor = LittleEnd2Normal(W.ValM); 
					//this.reg[W.dstM] = Number("0x"+nor);
					this.reg[W.dstM]=W.ValM;
					break;

				case IOPL:
					this.reg[W.dstE] = W.ValE;
				break;

				case IJXX:
				break;

				case ICALL:
					this.reg[W.dstE] = W.ValE;
				break;

				case IRET:
					this.reg[W.dstE] = W.ValE;
				break;

				case IPUSHL:
					this.reg[W.dstE] = W.ValE;
				break;

				case IPOPL:
					this.reg[W.dstE] = W.ValE;
					this.reg[W.dstM] = W.ValM;
				break;

			}

			SPC.set_W_icode( W.icode );
			SPC.set_W_ValM( W.ValM );

			FB.set_W_dstM( W.dstM );
			FB.set_W_ValM( W.ValM );
			FB.set_W_dstE( W.dstE );
			FB.set_W_ValE( W.ValE );

			SFA.set_W_dstM( W.dstM );
			SFA.set_W_ValM( W.ValM );
			SFA.set_W_dstE( W.dstE );
			SFA.set_W_ValE( W.ValE );
		}
	}


	//实现SelectPC
	function SelectPC( )
	{

	}
	SelectPC.prototype={
		set_M_Bch : function( M_Bch )
		{
			this.M_Bch = M_Bch;
		},
		set_M_ValA : function( M_ValA )
		{
			this.M_ValA = M_ValA;
		},
		set_M_icode : function( M_icode )
		{
			this.M_icode = M_icode;
		},
		set_W_icode : function( W_icode )
		{
			this.W_icode = W_icode;
		},
		set_W_ValM : function( W_ValM )
		{
			this.W_ValM = W_ValM;
		},
		set_F_predPC : function( F_predPC )
		{
			this.F_predPC = F_predPC;
		},
		select : function()
		{
			if( this.M_icode == IJXX && !this.M_Bch )
			{
				return this.M_ValA;
			}
			if( this.W_icode == IRET )
			{
				return this.W_ValM;
			}
			return this.F_predPC;
		}
	}


	//实现PredictPC
	function PredictPC( )
	{

	}
	PredictPC.prototype={
		set_f_icode : function( f_icode )
		{
			this.f_icode = f_icode;
		},
		set_f_ValC : function( f_ValC )
		{
			this.f_ValC = f_ValC;
		},
		set_f_ValP : function( f_ValP )
		{
			this.f_ValP = f_ValP;
		},
		predict : function()
		{
			if( this.f_icode == IJXX || this.f_icode == ICALL )
			{
				return this.f_ValC;
			}
			return this.f_ValP;
		}
	}

	//实现ForwardB
	function FwdB()
	{

	}
	FwdB.prototype={
		set_E_dstE : function( E_dstE )
		{
			this.E_dstE = E_dstE;
		},
		set_e_ValE : function( e_ValE )
		{
			this.e_ValE = e_ValE;
		},
		set_M_dstE : function( M_dstE )
		{
			this.M_dstE = M_dstE;
		},
		set_M_ValE : function( M_ValE )
		{
			this.M_ValE = M_ValE;
		},
		set_M_dstM : function( M_dstM )
		{
			this.M_dstM = M_dstM;
		},
		set_m_ValM : function( m_ValM )
		{
			this.m_ValM = m_ValM;
		},
		set_W_dstM : function( W_dstM )
		{
			this.W_dstM = W_dstM;
		},
		set_W_ValM : function( W_ValM )
		{
			this.W_ValM = W_ValM;
		},
		set_W_dstE : function( W_dstE )
		{
			this.W_dstE = W_dstE;
		},
		set_W_ValE : function( W_ValE )
		{
			this.W_ValE = W_ValE;
		},
		set_d_srcB : function( d_srcB )
		{
			this.d_srcB = d_srcB;
		},
		set_d_rvalB : function( d_rvalB )
		{
			this.d_rvalB = d_rvalB;
		},
		forwardB : function()
		{
			if( this.d_srcB == this.E_dstE )
				return this.e_ValE;
			if( this.d_srcB == this.M_dstM )
				return this.m_ValM;
			if( this.d_srcB == this.M_dstE )
				return this.M_ValE;
			if( this.d_srcB == this.W_dstM )
				return this.W_ValM;
			if( this.d_srcB == this.W_dstE )
				return this.W_ValE;
			return this.d_rvalB;
		}

	}

	//实现Select+ForwardA
	function SelFwdA()
	{

	}
	SelFwdA.prototype={
		set_E_dstE : function( E_dstE )
		{
			this.E_dstE = E_dstE;
		},
		set_e_ValE : function( e_ValE )
		{
			this.e_ValE = e_ValE;
		},
		set_M_dstE : function( M_dstE )
		{
			this.M_dstE = M_dstE;
		},
		set_M_ValE : function( M_ValE )
		{
			this.M_ValE = M_ValE;
		},
		set_M_dstM : function( M_dstM )
		{
			this.M_dstM = M_dstM;
		},
		set_m_ValM : function( m_ValM )
		{
			this.m_ValM = m_ValM;
		},
		set_W_dstM : function( W_dstM )
		{
			this.W_dstM = W_dstM;
		},
		set_W_ValM : function( W_ValM )
		{
			this.W_ValM = W_ValM;
		},
		set_W_dstE : function( W_dstE )
		{
			this.W_dstE = W_dstE;
		},
		set_W_ValE : function( W_ValE )
		{
			this.W_ValE = W_ValE;
		},
		set_d_srcA : function( d_srcA )
		{
			this.d_srcA = d_srcA;
		},
		set_d_rvalA : function( d_rvalA )
		{
			this.d_rvalA = d_rvalA;
		},
		set_D_icode : function( D_icode )
		{
			this.D_icode = D_icode;
		},
		set_D_ValP : function( D_ValP )
		{
			this.D_ValP = D_ValP;
		},
		select_forwardA : function()
		{
			if( this.D_icode == ICALL || this.D_icode == IJXX )
				return this.D_ValP;
			if( this.d_srcA == this.E_dstE )
				return this.e_ValE;
			if( this.d_srcA == this.M_dstM )
				return this.m_ValM;
			if( this.d_srcA == this.M_dstE )
				return this.M_ValE;
			if( this.d_srcA == this.W_dstM )
				return this.W_ValM;
			if( this.d_srcA == this.W_dstE )
				return this.W_ValE;
			return this.d_rvalA;
		}

	}


	//实现PipeControlLogic
	function PipeControlLogic()
	{

	}
	PipeControlLogic.prototype={
		initialize : function()
		{
			this.M_icode = -1;
			this.e_Bch = false;
			this.E_dstM = -2;
			this.E_icode = -1;
			this.d_srcB = -3;
			this.d_srcA = -4;
			this.D_icode = -1;
		},
		set_M_icode : function( M_icode )
		{
			this.M_icode = M_icode;
		},
		set_e_Bch : function( e_Bch )
		{
			this.e_Bch = e_Bch;
		},
		set_E_dstM : function( E_dstM )
		{
			this.E_dstM = E_dstM;
		},
		set_E_icode : function( E_icode )
		{
			this.E_icode = E_icode;
		},
		set_d_srcB : function( d_srcB )
		{
			this.d_srcB = d_srcB;
		},
		set_d_srcA : function( d_srcA )
		{
			this.d_srcA = d_srcA;
		},
		set_D_icode : function( D_icode )
		{
			this.D_icode = D_icode;
		},
		E_bubble : function()
		{
			if(this.E_icode ==  IJXX && !this.e_Bch) count_mispredict++;
			if(( this.E_icode == IMRMOVL || this.E_icode == IPOPL ) &&
					( this.E_dstM ==  this.d_srcA || this.E_dstM == this.d_srcB ))  count_loan_use++;
			return ( this.E_icode ==  IJXX && !this.e_Bch ) ||
					( this.E_icode == IMRMOVL || this.E_icode == IPOPL ) &&
					( this.E_dstM ==  this.d_srcA || this.E_dstM == this.d_srcB );
		},
		D_bubble : function()
		{
			if(this.E_icode == IJXX && !this.e_Bch) count_mispredict++;
			if(IRET == this.D_icode || IRET == this.E_icode || IRET == this.M_icode) count_ret++;
			return ( this.E_icode == IJXX && !this.e_Bch ) || 
					( IRET == this.D_icode || IRET == this.E_icode || IRET == this.M_icode );
		},
		D_stall : function()
		{
			return ( this.E_icode == IMRMOVL || this.E_icode == IPOPL ) &&
					( this.E_dstM == this.d_srcA || this.E_dstM == this.d_srcB );
		},
		F_stall : function()
		{
			return ( this.E_icode == IMRMOVL || this.E_icode == IPOPL ) &&
					( this.E_dstM == this.d_srcA || this.E_dstM == this.d_srcB ) ||
					( IRET == this.D_icode || IRET == this.E_icode || IRET == this.M_icode );
		}
	}


	//实现小端模式转换到正常模式
	function LittleEnd2Normal( lend )
	{
		var nor = "";
		nor += lend.substring(6,8);
		nor += lend.substring(4,6);
		nor += lend.substring(2,4);
		nor += lend.substring(0,2);
		return nor;
	}

	//将读入的内存转换到整型
	function RawToInt( raw )
	{
		var nor = LittleEnd2Normal( raw );
		var n = Number("0x"+nor);
		if( n <= 0xfffffff )
		{
			return n;
		}
		else
		{
			return ~n+1;
		}
	}


	//克隆一个对象
	function objClone(obj)
	{
		if (obj.cloneNode != null)
			return obj.cloneNode(true);
		result = new Object();
		result.constructor = obj.constructor
		for (var i in obj)
			result[i] = obj[i];
		return result;
	}

	
    /*var a={1:"a",2:"b",3:"c"};
    var b=objClone(a);
    a["1"]="z";*/
    //记录之前的寄存器状态
        



	//实现Y86模拟器
	function Y86Simulator( rawString )
	{
		this.rawString = rawString ;
		this.cycle = 0;
		this.clockFequency = 1000;
	}
	Y86Simulator.prototype={
		buildMemory : function()
		{
			this.addr=window.VM.Memory;
		},
		initialize : function()
		{
			this.reg = new Array();
			for( var i = 0 ; i < 8 ; i++ )
			{
				this.reg[i]=0;
			}
			this.reg[ROF] = false;
			this.reg[RZF] = false;
			this.reg[RSF] = false;

			this.curF = new positionF();
			this.curD = new positionD();
			this.curE = new positionE();
			this.curM = new positionM();
			this.curW = new positionW();


			this.curF.set_predPC(0);
			this.curF.set_state( SNOR );

			this.curD.set_icode(0);
			this.curD.set_ifun(0);
			this.curD.set_rA(0);
			this.curD.set_rB(0);
			this.curD.set_ValC(0);
			this.curD.set_ValP(0);
			this.curD.set_state( SNOR );

			this.curE.set_icode(0);
			this.curE.set_ifun(0);
			this.curE.set_ValC(0);
			this.curE.set_ValA(0);
			this.curE.set_ValB(0);
			this.curE.set_dstE(0);
			this.curE.set_dstM(0);
			this.curE.set_srcA(0);
			this.curE.set_srcB(0);
			this.curE.set_state( SNOR );

			this.curM.set_icode(0);
			this.curM.set_Bch(false);
			this.curM.set_ValE(0);
			this.curM.set_ValA(0);
			this.curM.set_dstE(0);
			this.curM.set_dstM(0);
			this.curM.set_state( SNOR );

			this.curW.set_icode(0);
			this.curW.set_ValE(0);
			this.curW.set_ValM(0);
			this.curW.set_dstE(0);
			this.curW.set_dstM(0);
			this.curW.set_state( SNOR );

			this.inF = objClone(this.curF);
			this.inD = objClone(this.curD);
			this.inE = objClone(this.curE);
			this.inM = objClone(this.curM);
			this.inW = objClone(this.curW);

			this.SPC = new SelectPC();
			this.SPC.set_M_Bch( false );
			this.SPC.set_M_icode( -1 );
			this.SPC.set_W_icode( -1 );

			this.FB = new FwdB();
			this.FB.set_d_srcB(-1);

			this.SFA = new SelFwdA();
			this.SFA.set_d_srcA(-1);
			this.SFA.set_D_icode(-1);

			this.PCL = new PipeControlLogic();
			this.PCL.initialize();

			this.exeF = new executeF( this.addr, this.reg );
			this.exeD = new executeD( this.addr, this.reg );
			this.exeE = new executeE( this.addr, this.reg );
			this.exeM = new executeM( this.addr, this.reg );
			this.exeW = new executeW( this.addr, this.reg );

		},
		nextCycle : function()
		{
			if( this.curW.state == SHLT )
			{
				return;
			}
			var F_stall = this.PCL.F_stall();
			var D_stall = this.PCL.D_stall();
			var D_bubble = this.PCL.D_bubble();
			var E_bubble = this.PCL.E_bubble();

			if( F_stall )
			{

			}
			else
			{
				this.curF = objClone(this.inF);
			}
			

			if( D_bubble )
			{
				this.curD.nop_state();
			}else if( D_stall )
			{

			}else
			{
				this.curD = objClone(this.inD);
			}

			if( E_bubble )
			{
				this.curE.nop_state();
			}
			else
			{
				this.curE = objClone(this.inE);
			}
			
			this.curM = objClone(this.inM);
			this.curW = objClone(this.inW);
			
			var temp=clone(this.inF);

			if(F_record.length==this.cycle) 
		    {
		    	if(record_flag[this.cycle]==undefined)
			    {
			    	status.recordF(clone(this.curF));
		            status.recordD(clone(this.curD));
		            status.recordE(clone(this.curE));
		            status.recordM(clone(this.curM));
		            status.recordW(clone(this.curW));
		            status.recordinF(temp);
		            status.recordinD(clone(this.inD));
		            status.recordinE(clone(this.inE));
		            status.recordinM(clone(this.inM));
		            status.recordinW(clone(this.inW));
		            record_flag[this.cycle]=1;
		        }
		    }
			//this.exeF.execute( this.curF, this.inD, this.inF, this.SPC );
			this.exeE.execute( this.curE, this.inM, this.FB, this.SFA, this.PCL  );
			this.exeM.execute( this.curM, this.inW, this.SPC, this.FB, this.SFA, this.PCL  );
			this.exeW.execute( this.curW, this.SPC, this.FB, this.SFA  ); 
			this.exeF.execute( this.curF, this.inD, this.inF, this.SPC );
			this.exeD.execute( this.curD, this.inE, this.FB, this.SFA, this.PCL );

            if(SPC_record.length==this.cycle)
            {
            	    status.recordSPC(clone(this.SPC));
		            status.recordFB(clone(this.FB));
		            status.recordSFA(clone(this.SFA));
		            status.recordPCL(clone(this.PCL));
            }
			var debuginfo = this.curF.predPC.toString(16);

			var CPIValue = calculate_CPI();
			window.CPI_cycle[this.cycle] = this.cycle;
			window.CPI_value[this.cycle] = CPIValue;
            $("#Show_CPI").html(CPIValue);
			$("#esp").html("0x"+this.reg[4].toString(16));
			$("#ebp").html("0x"+this.reg[5].toString(16));
			$("#eax").html("0x"+this.reg[0].toString(16));
			$("#ebx").html("0x"+this.reg[3].toString(16));
			$("#ecx").html("0x"+this.reg[1].toString(16));
			$("#edx").html("0x"+this.reg[2].toString(16));
			$("#esi").html("0x"+this.reg[6].toString(16));
			$("#edi").html("0x"+this.reg[7].toString(16));
			window.output += "Cycle_"+this.cycle+'\n';
			$('#currentCycle').html("Cycle "+this.cycle);
			$('#currentCycle').animate({
				opacity:1,
				backgroundColor:'rgba(255,255,255,0.3)'
				},
				window.delay/2);
			$('#currentCycle').animate({
				opacity:0
				},
				window.delay/2);
			window.output += "--------------------\n";
			window.output += this.curF.toString();
			window.output += this.curD.toString();
			window.output += this.curE.toString();
			window.output += this.curM.toString();
			window.output += this.curW.toString();
			window.output += '\n';
			this.cycle++;


		},
		reset:function()
        {
        	$('#currentCycle').html("Cycle 0");
        	window.VM.CPU.initialize();
        	this.cycle=0;
        	count_total_ins=0
	        count_mrmovl=0;
	        count_popl=0;
	        count_cond_branch=0;
	        count_ret=0;
	        count_loan_use=0;
	        count_mispredict=0;
	        $('#Show_CPI').html(calculate_CPI());
	        $("#esp").html("0x" + this.reg[4].toString(16));
			$("#ebp").html("0x" + this.reg[5].toString(16));
			$("#eax").html("0x" + this.reg[0].toString(16));
			$("#ebx").html("0x" + this.reg[3].toString(16));
			$("#ecx").html("0x" + this.reg[1].toString(16));
			$("#edx").html("0x" + this.reg[2].toString(16));
			$("#esi").html("0x" + this.reg[6].toString(16));
			$("#edi").html("0x" + this.reg[7].toString(16));
        	window.output += this.curF.toString();
			window.output += this.curD.toString();
			window.output += this.curE.toString();
			window.output += this.curM.toString();
			window.output += this.curW.toString();
        },
		lastCycle : function()
        {
	        if(this.cycle>0)
	        {
	        	this.cycle--;
	        	if(this.cycle==0)  this.reset();
	        	else
	        	{
        	    $('#currentCycle').html("Cycle "+(this.cycle-1));
        	    this.curF=clone(F_record[this.cycle-1]);
		        this.curD=clone(D_record[this.cycle-1]);
		        this.curE=clone(E_record[this.cycle-1]);
		        this.curM=clone(M_record[this.cycle-1]);
		        this.curW=clone(W_record[this.cycle-1]);
		        this.inF=clone(inF_record[this.cycle]);
		        this.inD=clone(inD_record[this.cycle]);
		        this.inE=clone(inE_record[this.cycle]);
		        this.inM=clone(inM_record[this.cycle]);
		        this.inW=clone(inW_record[this.cycle]);
		        this.SPC=clone(SPC_record[this.cycle]);
		        this.FB=clone(FB_record[this.cycle]);
		        this.SFA=clone(SFA_record[this.cycle]);
		        this.PCL=clone(PCL_record[this.cycle]);
			    window.output += "--------------------\n";
			    window.output += this.curF.toString();
			    window.output += this.curD.toString();
			    window.output += this.curE.toString();
			    window.output += this.curM.toString();
			    window.output += this.curW.toString();
			    window.output += '\n';
			    }
		    }
        }, 
		run : function(){
			alert("run!");
			function timedCount()
			{
				window.VM.CPU.nextCycle();
				t = setTimeout("timedCount()",1000);
			}

		},
		show_reg:function()
		{
	    
		    $("#esp").html(this.reg[4]);
	        $("#ebp").html(this.reg[5]);
	        $("#eax").html(this.reg[0]);
	        $("#ebx").html(this.reg[3]);
	        $("#ecx").html(this.reg[1]);
	        $("#edx").html(this.reg[2]);
	        $("#esi").html(this.reg[6]);
	        $("#edi").html(this.reg[7]);
	    },
	    select_reg:function(x)
	    {
	    	var sel;
	    	switch(x)
	    	{
	    		case"%eax":sel=0;break;
    	        case"%ecx":sel=1;break;
    	        case"%edx":sel=2;break;
    	        case"%ebx":sel=3;break;
    	        case"%esp":sel=4;break;
    	        case"%ebp":sel=5;break;
    	        case"%esi":sel=6;break;
    	        case"%edi":sel=7;break;
    	    }
    	    return sel;
	    },
		Y86compiler:function()
        {
    	    var dir=prompt("Please enter a Y86 instruction");
    	    var dir_trimmed=$.trim(dir);
    	    var action,R1="",R2,Im;
    	    var i,j,k,temp;
    	    //拆分指令
    	    for(i=0;i<dir_trimmed.length;i++)
    	    {
    	    	if(dir_trimmed[i]==' ')
    	    	{
    	    		action=dir_trimmed.substring(0,i);
    	    		break;
    	    	}
    	    }
    	    for(j=i+1,k=j;j<dir_trimmed.length;j++)
    	    {
    	    	if(dir_trimmed[j]==' ') {k++;continue;}
    	    	else
    	    	{
    	    		if(dir_trimmed[j]!=','&&dir_trimmed[j]!=' ')
    	    		{
    	    			R1+=dir_trimmed[j];
    	    		}
    	    		if(dir_trimmed[j]==',') break;
    	    	}
    	    }
    	    for(k=j+1,temp=k;k<dir_trimmed.length;k++)
    	    {
    	    	if(dir_trimmed[k]==' ') temp++; 
    	    }
    	    R2=dir_trimmed.substring(temp,dir_trimmed.length);

            //处理加法
    	    if(action=="addl")
    	    {
    	    	var select_reg1,select_reg2;
    	    	select_reg2=this.select_reg(R2);
    	    	if(isNaN(R1))
    	    	{
    	    		select_reg1=this.select_reg(R1);
    	    		this.reg[select_reg2]+=this.reg[select_reg1];
    	    	}
    	    	else
    	    	{
    	    		Im=parseInt(R1,10);
    	    		this.reg[select_reg2]+=Im;
    	    	}
    	    	this.show_reg();
    	    }

    	    //处理减法
    	    if(action=="subl")
    	    {
    	    	var select_reg1,select_reg2;
    	    	select_reg2=this.select_reg(R2);
    	    	if(isNaN(R1))
    	    	{
    	    		select_reg1=this.select_reg(R1);
    	    		this.reg[select_reg2]-=this.reg[select_reg1];
    	    	}
    	    	else
    	    	{
    	    		Im=parseInt(R1,10);
    	    		this.reg[select_reg2]-=Im;
    	    	}
    	    	this.show_reg();
    	    }

    	    //处理乘法
    	    if(action=="imull")
    	    {
    	    	var select_reg1,select_reg2;
    	    	select_reg2=this.select_reg(R2);
    	    	if(isNaN(R1))
    	    	{
    	    		select_reg1=this.select_reg(R1);
    	    		this.reg[select_reg2]*=this.reg[select_reg1];
    	    	}
    	    	else
    	    	{
    	    		Im=parseInt(R1,10);
    	    		this.reg[select_reg2]*=Im;
    	    	}
    	    	this.show_reg();
    	    }

    	    //处理除法
    	    if(action=="divl")
    	    {
    	    	var select_reg1,select_reg2;
    	    	select_reg2=this.select_reg(R2);
    	    	if(isNaN(R1))
    	    	{
    	    		select_reg1=this.select_reg(R1);
    	    		this.reg[select_reg2]/=this.reg[select_reg1];
    	    	}
    	    	else
    	    	{
    	    		Im=parseInt(R1,10);
    	    		this.reg[select_reg2]/=Im;
    	    	}
    	    	this.show_reg();
    	    }

    	    //处理移动
    	    if(action=="movl")
    	    {
    	    	var select_reg1,select_reg2;
    	    	select_reg2=this.select_reg(R2);
    	    	if(isNaN(R1))
    	    	{
    	    		select_reg1=this.select_reg(R1);
    	    		this.reg[select_reg2]=this.reg[select_reg1];
    	    	}
    	    	else
    	    	{
    	    		Im=parseInt(R1,10);
    	    		this.reg[select_reg2]=Im;
    	    	}
    	    	this.show_reg();
    	    }
        } 
	}

	function calculate_CPI()
	{
		var ins_freq={
			load_use:count_total_ins==0?0:(count_mrmovl+count_popl)/count_total_ins,
			mis:count_total_ins==0?0:count_cond_branch/count_total_ins,
			ret:count_total_ins==0?0:count_ret/count_total_ins
		};

		var cond_freq={
			load_use:(count_mrmovl+count_popl)==0?0:count_loan_use/(count_mrmovl+count_popl),
			mis:count_cond_branch==0?0:count_mispredict/count_cond_branch,
			ret:1
		};

		var lp=ins_freq["load_use"]*cond_freq["load_use"];
		var mp=ins_freq["mis"]*cond_freq["mis"];
		var rp=3*ins_freq["ret"]*cond_freq["ret"];

		var CPI=1.0+lp+mp+rp;
		return CPI.toFixed(3);
	}

	function clone(obj) {
      var o;
      if (typeof obj == "object") {
          if (obj === null) {
              o = null;
          } else {
              if (obj instanceof Array) {
                  o = [];
                  for (var i = 0, len = obj.length; i < len; i++) {
                     o.push(clone(obj[i]));
                 }
             } else {
                 o = {};
                 for (var j in obj) {
                     o[j] = clone(obj[j]);
                 }
             }
         }
     } else {
         o = obj;
     }
     return o;
    }

        var F_record=new Array();
		var D_record=new Array();
		var E_record=new Array();
		var M_record=new Array();
		var W_record=new Array();
		var inF_record=new Array();
		var inD_record=new Array();
		var inE_record=new Array();
		var inM_record=new Array();
		var inW_record=new Array();
		var SPC_record=new Array();
		var FB_record=new Array();
		var SFA_record=new Array();
		var PCL_record=new Array();
		var record_flag=new Array();

	function record()
		{

		}
		record.prototype={

			recordF : function(F)
	        {
                F_record.push(clone(F));
	        },
	        recordD:function(D)
	       {
                D_record.push(clone(D));
	       },
	        recordE:function(E)
	       {
                E_record.push(clone(E));
	       },
	        recordM:function(M)
	       {
                M_record.push(clone(M));
	       },
	        recordW:function(W)
	       {
                W_record.push(clone(W));
       	   },
       	   recordinF:function(inF)
	        {
                inF_record.push(clone(inF));
	        },
	        recordinD:function(inD)
	       {
                inD_record.push(clone(inD));
	       },
	        recordinE:function(inE)
	       {
                inE_record.push(clone(inE));
	       },
	        recordinM:function(inM)
	       {
                inM_record.push(clone(inM));
	       },
	        recordinW:function(inW)
	       {
                inW_record.push(clone(inW));
       	   },
       	   recordSPC:function(SPC)
       	   {
       	   	  SPC_record.push(clone(SPC));
       	   },
       	   recordFB:function(FB)
       	   {
       	   	  FB_record.push(clone(FB));
       	   },
       	   recordSFA:function(SFA)
       	   {
       	   	  SFA_record.push(clone(SFA));
       	   },
       	   recordPCL:function(PCL)
       	   {
       	   	  PCL_record.push(clone(PCL));
       	   }
		}
    var status=new record();

	window.VM.CPU = new Y86Simulator();
	window.VM.CPU.buildMemory();
	window.VM.CPU.initialize();
})();