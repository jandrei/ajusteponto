var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    linhas:[],
    linhaTotal:{totalHoras:0,totalExtras:0},
    dados:'',
    data:null,
    diaInicial:null,
    mesInicial:null,
    anoInicial:null,
    ultimaDataCalculada:null,
    datetime:new Date()
  },
  methods: {

    copiar: function () {
      var l = this.dados.split('\n');
      var lFiltrado = [];
      var vm = this;

      l.forEach(function (row){
        if (row.indexOf("PERIODO") >0 && vm.data == null){
          //vm.data = row;
          console.log(row);
          var data = row.trim().replace("PERIODO DE: ","");
          console.log(data);
          data = data.slice(0,10);
          //var objData = new Date(year, month, day, hours, minutes, seconds, milliseconds)
          vm.diaInicial=data.slice(0,2);
          vm.mesInicial=parseInt(data.slice(3,5)) -1;
          vm.anoInicial=data.slice(6,10);

          var objData = new Date(vm.anoInicial,vm.mesInicial,vm.diaInicial, 0,0,0,0)
          vm.data = objData;
          return;
        }

        if (
          row.trim().length > 0 &&
          row.indexOf("MATRICULA") < 0 &&
          row.indexOf("PERIODO") < 0 &&
          row.indexOf("HORAS") < 0 &&
          row.indexOf("Dia") < 0 &&
          //  row.indexOf("SAB") < 0 &&
          //  row.indexOf("DOM") < 0 &&
          row.indexOf("PONTO") < 0 &&
          row.indexOf("PON") < 0 &&
          row.indexOf("PROCERGS")){

            row = row.trim();

            row = row.replace('        ',';').replace(' ',';');

            while(row.indexOf(' ') >=0){
              row = row.replace('  ',';');
              row = row.replace(' ',';');
            }

            lFiltrado.push(vm.processaRow(row));
          }
        })
        this.linhas = lFiltrado;
        var totalHoras = 0;
        var totalMinutos = 0;

        var totalHorasEX = 0;
        var totalMinutosEX = 0;


        console.log(totalHoras + inteiro + decimal);
        this.linhas.forEach(function(linha){
          totalHoras += linha.totalValidas ? linha.totalValidas.getHours() : 0;
          totalMinutos += linha.totalValidas ? linha.totalValidas.getMinutes() : 0;

          totalHorasEX += linha.totalExtras ? linha.totalExtras.getHours() : 0;
          totalMinutosEX += linha.totalExtras ? linha.totalExtras.getMinutes() : 0;
        });
        var horas = totalMinutos/60;
        var inteiro = Math.trunc(horas);
        var decimal = horas -inteiro;
        this.linhaTotal.totalValidas = Math.trunc((totalHoras + inteiro + decimal) * 100)/100;

        horas = totalMinutosEX/60;
        inteiro = Math.trunc(horas);
        decimal = horas -inteiro;
        this.linhaTotal.totalExtras = Math.trunc((totalHorasEX + inteiro + decimal)* 100)/100;
      },
      processaRow: function(row){
        var retorno = {}
        var campos = row.split(";");
        retorno.dia = this.incrementaEPegaDiaCorreto(campos[0]);

        if (campos.length < 5 || campos[1].indexOf('SAB')>=0 || campos[1].indexOf('DOM')>=0){
          return retorno;
        }

        retorno.entrada1Original = this.pegaDiaEHoraCorreto(retorno.dia,this.horaToSeconds(campos[1]));
        retorno.saida1Original = this.pegaDiaEHoraCorreto(retorno.dia,this.horaToSeconds(campos[2]));
        retorno.entrada2Original = this.pegaDiaEHoraCorreto(retorno.dia,this.horaToSeconds(campos[3]));;
        retorno.saida2Original = this.pegaDiaEHoraCorreto(retorno.dia,this.horaToSeconds(campos[4]));;

        retorno.entrada1OriginalExtra =this.pegaDiaEHoraCorreto(retorno.dia, this.horaToSeconds(campos[5]));;
        retorno.saida1OriginalExtra = this.pegaDiaEHoraCorreto(retorno.dia,this.horaToSeconds(campos[6]));;

        retorno.totalValidas = this.somaTotalHorasValidas(retorno);
        retorno.totalExtras = this.somaTotalHorasExtras(retorno);
        return retorno;
      },
      somaTotalHorasValidas:function (linha){
        if(linha.saida1Original ==null
          || linha.entrada1Original == null
          || linha.saida2Original == null
          || linha.entrada2Original == null){
            return null;
          }
          var totalManha = linha.saida1Original.getTime() - linha.entrada1Original.getTime();
          var totalTarde = linha.saida2Original.getTime() - linha.entrada2Original.getTime();

          var total = totalManha + totalTarde;
          var dataSemHoras = new Date(linha.dia.getFullYear(),linha.dia.getMonth(),linha.dia.getDate()).getTime();
          var data = new Date(total+dataSemHoras);

          return data;
        },
        somaTotalHorasExtras:function (linha){
          if(linha.entrada1OriginalExtra ==null
            || linha.saida1OriginalExtra == null){
              return null;
            }
            var totalManha = linha.saida1OriginalExtra.getTime() - linha.entrada1OriginalExtra.getTime();

            var dataSemHoras = new Date(linha.dia.getFullYear(),linha.dia.getMonth(),linha.dia.getDate()).getTime();

            var data = new Date(totalManha+dataSemHoras);

            return data;
          },
          pegaDiaEHoraCorreto:function(date,strHora){
            if (strHora == null){
              return null;
            }
            return new Date(date.getFullYear(),date.getMonth(),date.getDate(),strHora.slice(0,2),strHora.slice(3,5),strHora.slice(6,8),0);
          },
          incrementaEPegaDiaCorreto:function(dia){
            if (this.ultimaDataCalculada == null){
              this.ultimaDataCalculada = new Date(this.anoInicial,this.mesInicial,dia, 0,0,0,0)

              return new Date(this.anoInicial,this.mesInicial,this.diaInicial, 0,0,0,0);
            }

            this.ultimaDataCalculada.setDate(this.ultimaDataCalculada.getDate() + 1);

            return new Date(this.ultimaDataCalculada.getFullYear(),this.ultimaDataCalculada.getMonth(),this.ultimaDataCalculada.getDate());
          },
          horaToSeconds: function (time) {
            if (!time || time.trim().length ==0){
              return null;
            }

            if (time.length==3){
              time = "0"+time;
            }
            time = (time.slice(0, 2) + ":" + time.slice(2)+":00")
            return time;
          },
          formataData:function(date){
            return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
          },
          formataHoras:function(date){
            try{

              if (date == null || (!date ===Date)){
                return "";
              }
              var h,m,s;
              h = (date.getHours());
              m = ( date.getMinutes() );
              s = date.getSeconds();

              h = h < 10 ? "0" + h : h;
              m = m < 10 ? "0" + m : m;
              s = s < 10 ? "0" + s : s;

              return  h+ ":" + m ;
            }catch(e){
              console.log(date);
              console.log(e)
            }
          },
          limpar: function () {
            this.message= 'Hello Vue!';
            this.linhas=[];
            this.linhaTotal={totalHoras:0,totalExtras:0};
            this.dados='';
            this.data=null;
            this.diaInicial=null;
            this.mesInicial=null;
            this.anoInicial=null;
            this.ultimaDataCalculada=null;
          }
        }
      })
