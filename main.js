const seed = 12345;
const random = mulberry32(seed);

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const world = new Map();
const currentPosition = { x: 0, y: 0 };
let lastDirection = 'north';

function getKey(x, y) {
  return `${x},${y}`;
}

function getValidRooms(x, y, world, roomTemplates) {
  return roomTemplates.filter((room) => {
    // 1. Must not match any adjacent room by filename
    for (const { dx, dy } of [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 }
    ]) {
      const neighbor = world.get(getKey(x + dx, y + dy));
      if (neighbor && neighbor.filename === room.filename) {
        return false;
      }
    }

    // 2. Door compatibility check
    const neighbors = [
      { dx: 0, dy: -1, dir: 'north', opp: 'south' },
      { dx: 0, dy: 1, dir: 'south', opp: 'north' },
      { dx: 1, dy: 0, dir: 'east', opp: 'west' },
      { dx: -1, dy: 0, dir: 'west', opp: 'east' }
    ];

    for (const { dx, dy, dir, opp } of neighbors) {
      const neighbor = world.get(getKey(x + dx, y + dy));
      if (neighbor) {
        const neighborHasDoor = neighbor.doors[opp];
        const roomHasDoor = room.doors[dir];

        if (neighborHasDoor && !roomHasDoor) return false;
        if (!neighborHasDoor && roomHasDoor) return false;
      }
    }

    return true;
  }).map(room => ({ ...room })); // clone only, preserve id
}

function applyRoomWeights(x, y, validRooms) {
  return validRooms.map(room => {
    const numDoors = Object.values(room.doors).filter(Boolean).length;

    let bias = 0;
    if (x > 0 && room.doors.west) bias++;
    if (x < 0 && room.doors.east) bias++;
    if (y > 0 && room.doors.north) bias++;
    if (y < 0 && room.doors.south) bias++;

    const baseWeight = room.doors.north + room.doors.south + room.doors.east + room.doors.west;
    const weight = baseWeight + numDoors * 1 + bias * 1;
    return { ...room, weight };
  }).sort((a, b) => b.weight - a.weight);
}

function matchRoom(x, y) {
  const validRooms = getValidRooms(x, y, world, roomTemplates);
  if (validRooms.length === 0) {
    const neighbors = [
      { dx: 0, dy: -1, dir: 'north', opp: 'south' },
      { dx: 0, dy: 1, dir: 'south', opp: 'north' },
      { dx: 1, dy: 0, dir: 'east', opp: 'west' },
      { dx: -1, dy: 0, dir: 'west', opp: 'east' }
    ];
    const required = neighbors
      .filter(({ dx, dy, opp }) => {
        const neighbor = world.get(getKey(x + dx, y + dy));
        return neighbor && neighbor.doors[opp];
      })
      .map(n => n.dir).join(', ');
    alert(`No matching rooms found. Required doors (from neighbors): ${required}`);
    return null;
  }

  const weightedRooms = applyRoomWeights(x, y, validRooms);
  return weightedRooms[0];
}

function generateRoom(x, y, fromDirection) {
  const key = getKey(x, y);
  const isSecondRoom = world.size === 1;

  const baseRoom = isSecondRoom
    ? { ...roomTemplates[1], id: 1 }
    : matchRoom(x, y);

  if (baseRoom) {
    const roomInstance = {
      ...baseRoom,
      x,
      y,
      uid: `${baseRoom.id}-${x}-${y}` // unique per coordinate
    };
    world.set(key, roomInstance);
  }
}

function updateCompass() {
  const dx = 0 - currentPosition.x;
  const dy = 0 - currentPosition.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if(dx==0 && dy==0){
    angle = 0 - 90 - 45;
  }
  const compass = document.getElementById('compass');
  compass.style.transform = `rotate(${angle + 90+45}deg)`;
  
}

function renderRoom() {
  const key = getKey(currentPosition.x, currentPosition.y);
  let room = world.get(key);
  if (!room) {
    generateRoom(currentPosition.x, currentPosition.y, lastDirection);
    room = world.get(key);
  }
  const img = document.getElementById('roomImage');
  img.style.visibility = 'hidden';
  img.onload = () => {
    img.style.transform = room.flipped ? 'scaleX(-1)' : 'scaleX(1)';
    ['north', 'south', 'east', 'west'].forEach(dir => {
      document.getElementById(dir).style.display = room.doors[dir] ? 'block' : 'none';
    });
    img.style.visibility = 'visible';
    updateCompass();
  };
  img.src = `rooms/${room.filename}`;
}

function move(dir) {
  lastDirection = dir;
  switch (dir) {
    case 'north': currentPosition.y -= 1; break;
    case 'south': currentPosition.y += 1; break;
    case 'east': currentPosition.x += 1; break;
    case 'west': currentPosition.x -= 1; break;
  }
  renderRoom();
}

document.getElementById('compass').addEventListener('click', () => {
  navigator.clipboard.writeText(seed.toString()).then(() => {
    console.log('Seed copied to clipboard:', seed);
  });
});

['north', 'south', 'east', 'west'].forEach(dir => {
  document.getElementById(dir).addEventListener('click', () => move(dir));
});

// Assumes roomTemplates is defined globally elsewhere
world.set(getKey(0, 0), { ...roomTemplates[0], id: 0, x: 0, y: 0, uid: '0-0-0' });
renderRoom();
