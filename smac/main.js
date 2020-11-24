const { getRandomCoord, getTable, arraysEqual, getNeib8, choice } =  require('./utils');
const { plot, Plot } = require('nodeplotlib');
const assert = require('assert');


const EMPTY = 0;
const PERSON = 1;
const INFECTED = 2;
const IMUNE = 3;

class SpreadTable {
  constructor(table_size=20, population_size=100, start_disease=1) {
    this.table_size = table_size;
    this.population_size = population_size;
    this.start_disease = start_disease;
    this.table = this.__start_table();
  }

  reset() {
    this.table = this.__start_table();
  }

  step(infected_expire_time = 14, imunity_expire_time = 80) {

    for(let p_idx = 0; p_idx < this.people_coord.length; p_idx++) {
      const c = this.people_coord[p_idx];
      const status = this.table[c[0]][c[1]];

      
      if ( status === INFECTED) {
        this.people_coord[p_idx][2] += 1;

        if (this.people_coord[p_idx][2] > infected_expire_time) {

          this.people_coord[p_idx][2] = 0;
          this.table[c[0]][c[1]] = IMUNE;

        }
      }

      else if ( status === IMUNE) {
        this.people_coord[p_idx][2] += 1;

        if (this.people_coord[p_idx][2] > imunity_expire_time) {
          this.people_coord[p_idx][2] = 0;
          this.table[c[0]][c[1]] = PERSON;
        }
      }
    }

  }

  move(prob=0.8, fronzen=0) {
    for(let p_idx = 0; p_idx < this.people_coord.length; p_idx++) {

      if(p_idx < fronzen) continue; // Never move frozen people
      if(Math.random() > prob) continue; // Just move with a given prob

      const neib8 = getNeib8(this.people_coord[p_idx], this.table_size).filter(c => {
        for(let j = 0; j < this.people_coord.length; j++) {
          if (arraysEqual(this.people_coord[j], c) || this.table[c[0]][c[1]] !== EMPTY) {
            return false;
          }
        }
        return true;
      });

      const new_position = choice(neib8);// Select one possible random movement;

      if (!new_position) continue; // If can't go anywhere... stay there

      const cur_position = this.people_coord[p_idx];
      const cur_value = this.table[cur_position[0]][cur_position[1]];

      this.table[cur_position[0]][cur_position[1]] = EMPTY;

      this.table[new_position[0]][new_position[1]] = cur_value;

      this.people_coord[p_idx] = new_position;

    }

  }

  interact(r1 = 0.5) {
    for(let p_idx = 0; p_idx < this.people_coord.length; p_idx++) {
      const cur_position = this.people_coord[p_idx];
      const status = this.table[cur_position[0]][cur_position[1]];

      if(status === PERSON) {
        const neib8 = getNeib8(cur_position, this.table_size);

        for(let neib_idx = 0; neib_idx < neib8.length; neib_idx++) {
          const neib_pos = neib8[neib_idx];
          const neib_status = this.table[neib_pos[0]][neib_pos[1]];

          if(neib_status === INFECTED) {
            if(Math.random() < r1) {
              this.table[cur_position[0]][cur_position[1]] = INFECTED;
            }
          }
        }
      }
    }
  }

  get_desase(amount = 20, prob = 0.5) {
    let total = 0;
    for(let p_idx = 0; p_idx < this.people_coord.length && total < amount; p_idx++) {
      const cur_position = this.people_coord[p_idx];
      const status = this.table[cur_position[0]][cur_position[1]];

      if(status === PERSON) {
        if(Math.random() < prob) {
          this.table[cur_position[0]][cur_position[1]] = INFECTED;
        }
        total += 1;
      }
    }
  }

  get_metrics() {
    let counter = 0;
    for(let i = 0; i < this.table.length; i++) {
      for(let j = 0; j < this.table.length; j++) {
        if(this.table[i][j] === INFECTED) {
          counter++;
        }
      }
    }
    return counter;
  }

  __start_table() {
    const t = getTable(this.table_size);

    this.people_coord = [];

    for(let i = 0; i < this.population_size; i++) {
      let coord = getRandomCoord(this.table_size);
      let isInList = true;

      while (isInList) {
        isInList = false;
        for(let j = 0; j < this.people_coord.length; j++) {
          if (arraysEqual(this.people_coord[j], [...coord, 0])) {
            isInList = true;
          }
        }

        if(isInList) {
          coord = getRandomCoord(this.table_size);
        }
      }

      this.people_coord.push([...coord, 0]);

      if (i < this.start_disease) {
        t[coord[0]][coord[1]] = INFECTED;
      } else {
        t[coord[0]][coord[1]] = PERSON;
      }
    }

    assert(this.people_coord.length === this.population_size);

    return t;
  }
}

const s = new SpreadTable();

let sim1 = Array(180).fill(0);

for(let sim = 0; sim < 20; sim++) {
  s.reset();

  // Suppose a first wave where we DO social isolation/lockddow + gestes barieres
  for(let i = 0; i < 80; i++) {
    s.move(0.3, 70);
    s.interact(0.5);
    s.step();
    sim1[i] += s.get_metrics();
  }

  // So now everything is good and some people go travel...
  console.log('before traveling', s.get_metrics())
  s.get_desase(8, 0.3);
  console.log('after traveling', s.get_metrics())


  // and people start to go out and not respect gestes barières, because they think it's fine...
  for(let i = 0; i < 100; i++) {
    s.move(0.8, 10);
    s.interact(0.7);
    s.step();
    sim1[i+80] += s.get_metrics();
  }
}

sim1 = sim1.map(v => v/20.);

const data = [
  {y: sim1, x: Array.from({length: sim1.length}, (_, i) => i + 1), type: 'line'},

];
plot(data);