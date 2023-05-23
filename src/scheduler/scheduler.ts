import { deleteData, getData, setData } from "discordbot-data";
import process from './process.js';

export function schedule(type: string, data: Object, time: number) {
  setData('global', null, ['schedule', 'tasks', Math.floor(time / 1000).toString()], {type, data}, 'push')
}

export function execute() {
  let lastExecuted = getData<number>('global', null, ['schedule', 'last-executed']) ?? Math.floor(Date.now() / 1000) - 1;
  let exec = lastExecuted + 1;
  let allTask = getData<{[key: string]: {type: string, data: any}[]}>('global', null, ['schedule', 'tasks']) ?? {}
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
