import { deleteData, getData, setData } from "discordbot-data";
import process from './process';

export function schedule(type: string, data: Object, time: number) {
  setData('global', null, ['schedule', 'tasks', Math.floor(time / 1000).toString()], {type, data}, (a, v) => [...((a ?? []) as unknown[]), v])
}

export function execute() {
  let lastExecuted = (getData('global', null, ['schedule', 'last-executed']) ?? Math.floor(Date.now() / 1000) - 1) as number;
  let exec = lastExecuted + 1;
  let allTask = getData('global', null, ['schedule', 'tasks']) as {[key: string]: {type: string, data: any}[]} ?? {}
  for (; exec <= Math.floor(Date.now() / 1000); exec++) {
    let tasks = allTask[exec.toString()];
    if (tasks == null) continue;
    for (let task of tasks) {
      process(task.type, task.data);
    }
    deleteData('global', null, ['schedule', 'tasks', exec.toString()])
  }
  setData('global', null, ['schedule', 'last-executed'], exec - 1);
}
