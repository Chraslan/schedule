import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('schedule')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('refresh')
  refresh(){
    return{
      status: 200
    }
  }
  @Get('F')
  async getscheduleF(){
    const scheduleF = await this.appService.getscheduleF()
    return{
      Bloque: "F",
      schudule: {
        identificacion: scheduleF.identificacion,
        docente: scheduleF.docente,
        seccion: scheduleF.seccion,
        materia: scheduleF.materia,
        aula: scheduleF.aula,
        turno: scheduleF.turno,
        estado: scheduleF.estado,
        horaEntrada: scheduleF.horaEntrada,
        horaSalida: scheduleF.horaSalida
      }
    } 
  }
  @Get('G')
  async getscheduleG() {
    const scheduleG = await this.appService.getscheduleG()
    return {
      Bloque: "G",
      schudule: {
        identificacion: scheduleG.identificacion,
        docente: scheduleG.docente,
        seccion: scheduleG.seccion,
        materia: scheduleG.materia,
        aula: scheduleG.aula,
        turno: scheduleG.turno,
        estado: scheduleG.estado,
        horaEntrada: scheduleG.horaEntrada,
        horaSalida: scheduleG.horaSalida
      }
    }
  }

}
