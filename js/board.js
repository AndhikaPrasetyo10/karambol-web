let maxHeight = 700;
let maxWidth = 700;
let phi = 3.14;
let currentPlayer = 1;
let player = {
  1: { x: 360, y: 607, score: 0 },
  2: { x: 360, y: 112.5, score: 0 },
};
let striker = {
  batasKanan: 595,
  batasKiri: 132,
  vx: 0,
  vy: 0,
  radius: 12.5,
  massa: 5,
  color: "whitesmoke",
};
let coins = [
  { x: 335, y: 360, color: "#515050" },
  { x: 360, y: 360, color: "red" },
  { x: 385, y: 360, color: "#515050" },
  { x: 360, y: 385, color: "#515050" },
  { x: 335, y: 385, color: "brown" },
  { x: 385, y: 385, color: "brown" },
  { x: 360, y: 335, color: "#515050" },
  { x: 335, y: 335, color: "brown" },
  { x: 385, y: 335, color: "brown" },
];

coins.forEach((coin) => {
  coin.radius = 12.5;
  coin.massa = 5;
  coin.vx = 0;
  coin.vy = 0;
});

//tampilan board
function canvasCalls() {
  const canvas = document.getElementById("carromBoard");
  const ctx = canvas.getContext("2d");
  const image = document.getElementById("board");

  image.addEventListener("load", function () {
    ctx.drawImage(image, 0, 0);
    drawCoins(coins);
  });
}
function drawCoins(coins) {
  let ct = document.getElementById("Striker");
  let ctxt = ct.getContext("2d");
  coins.forEach((coin) => {
    ctxt.beginPath();
    ctxt.arc(coin.x, coin.y, coin.radius, 0, 360);
    ctxt.fillStyle = coin.color;
    ctxt.fill();
    ctxt.closePath();
  });
}

function drawCircle(striker, ctx) {
  ctx.beginPath();
  ctx.arc(striker.x, striker.y, striker.radius, 0, 360);
  ctx.fillStyle = striker.color;
  ctx.fill();
  ctx.closePath();
}

function drawLine(x1, y1, x2, y2, colorL, ctx) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = colorL;
  ctx.stroke();
}

// game function
function reset_func() {
  document.removeEventListener("keydown", moveStriker_key);
  document.removeEventListener("mousemove", garisImajiner);
  document.removeEventListener("click", onClick_striker);
}

function moveStriker_key(event) {
  let canvas = document.getElementById("Striker");
  let ctx = canvas.getContext("2d");
  if (event.key === "ArrowLeft" || event.key === "a") {
    if (striker.x - striker.radius > striker.batasKiri) {
      striker.x -= 5;
    }
  } else if (event.key === "ArrowRight" || event.key === "d") {
    if (striker.x + striker.radius < striker.batasKanan) {
      striker.x += 5;
    }
  }
  ctx.clearRect(0, 0, 720, 720);
  drawCoins(coins);
  drawCircle(striker, ctx);
}

function garisImajiner(event) {
  let canvas = document.getElementById("Striker");
  let ctx = canvas.getContext("2d");
  let xCoor = event.pageX;
  let yCoor = event.pageY;
  ctx.clearRect(0, 0, 720, 720);
  drawCoins(coins);
  drawCircle(striker, ctx);
  drawLine(striker.x, striker.y, xCoor - 390, yCoor, "black", ctx);
}

function onClick_striker(event) {
  let xCoor = event.pageX;
  let yCoor = event.pageY;
  let arahTembakan = Math.atan2(yCoor - striker.y, xCoor - 390 - striker.x);
  hitStriker(arahTembakan);
}

function striker_place() {
  reset_func();
  let canvas = document.getElementById("Striker");
  let ctx = canvas.getContext("2d");
  striker.x = player[currentPlayer].x;
  striker.y = player[currentPlayer].y;
  ctx.clearRect(0, 0, 720, 720);
  drawCoins(coins);
  drawCircle(striker, ctx);

  document.addEventListener("keydown", moveStriker_key);
  document.addEventListener("mousemove", garisImajiner);
  document.addEventListener("click", onClick_striker);
}

function hitStriker(arahTembakan) {
  let power = document.getElementById("power").value;
  let vox = power * Math.cos(arahTembakan);
  let voy = power * Math.sin(arahTembakan);
  striker.x = striker.x;
  striker.y = striker.y;
  striker.vx = vox;
  striker.vy = voy;
  updateFrame();
}

function updateFrame() {
  let canvas = document.getElementById("Striker");
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 720, 720);
  update_obj();
  drawCoins(coins);
  drawCircle(striker, ctx);
  //cek goal
  for (let i = 0; i < coins.length; i++) {
    if (coinGoal(coins[i])) {
      player[currentPlayer].score += 1;
      document.getElementById(`score${currentPlayer}`).innerHTML = player[currentPlayer].score;
      coins.splice(i, 1);
      switchPlayer();
    }
  }
  if (coinGoal(striker)) {
    player[currentPlayer].score -= 1;
    document.getElementById(`score${currentPlayer}`).innerHTML = player[currentPlayer].score;
    coins.push({ x: 360, y: 360, color: "brown", radius: 12.5, massa: 5, vx: 0, vy: 0 });
    switchPlayer();
    return;
  }
  if (detectObjectStop()) {
    switchPlayer();
  } else {
    requestAnimationFrame(updateFrame);
  }
}

//logic
function tabrakanObject(object1, object2) {
  let jarakAntarObj = Math.sqrt((object2.x - object1.x) ** 2 + (object2.y - object1.y) ** 2);
  let radius_2obj = object1.radius + object2.radius;

  if (jarakAntarObj < radius_2obj) {
    let angleTabrakan = Math.atan2(object2.y - object1.y, object2.x - object1.x);
    let arahX = Math.cos(angleTabrakan);
    let arahY = Math.sin(angleTabrakan);
    let v1 = object1.vx * arahX + object1.vy * arahY;
    let v2 = object2.vx * arahX + object2.vy * arahY;

    // v1 = [2m2 v2 + v1 ( m1 – m2)] / (m1 +m2 ) momentum dan energi kinetik
    let v1_after = (2 * object2.massa * v2 + v1 * (object1.massa - object2.massa)) / (object1.massa + object2.massa);
    let v2_after = (2 * object1.massa * v1 + v2 * (object2.massa - object1.massa)) / (object1.massa + object2.massa);

    object1.vx += (v1_after - v1) * arahX;
    object1.vy += (v1_after - v1) * arahY;
    object2.vx += (v2_after - v2) * arahX;
    object2.vy += (v2_after - v2) * arahY;

    //handle overlap
    let overlap = radius_2obj - jarakAntarObj;
    object1.x -= arahX * overlap;
    object1.y -= arahY * overlap;
    object2.x += arahX * overlap;
    object2.y += arahY * overlap;
  }
}

function gayaGesek(obj) {
  let N = obj.massa * 0.98;
  let koefisienGesek = 0.2;
  let F = koefisienGesek * N;
  return F;
}

function update_obj() {
  //striker gerak
  striker.x += striker.vx;
  striker.y += striker.vy;
  striker.vx *= gayaGesek(striker);
  striker.vy *= gayaGesek(striker);

  stopObj(striker);

  //tabrakan striker dan dinding
  if (striker.x - striker.radius + striker.vx < 20 || striker.x + striker.radius + striker.vx > maxWidth) {
    striker.vx = -striker.vx;
  }
  if (striker.y - striker.radius + striker.vy < 20 || striker.y + striker.radius + striker.vy > maxHeight) {
    striker.vy = -striker.vy;
  }

  coins.forEach((coin) => {
    coin.x += coin.vx;
    coin.y += coin.vy;
    coin.vx *= gayaGesek(coin);
    coin.vy *= gayaGesek(coin);

    stopObj(coin);

    //tabrakan coin dan dinding
    if (coin.x - coin.radius + coin.vx < 20 || coin.x + coin.radius + coin.vx > maxWidth) {
      coin.vx = -coin.vx;
    }
    if (coin.y - coin.radius + coin.vy < 20 || coin.y + coin.radius + coin.vy > maxHeight) {
      coin.vy = -coin.vy;
    }

    tabrakanObject(striker, coin);

    coins.forEach((coin2) => {
      if (coin != coin2) {
        tabrakanObject(coin, coin2);
      }
    });
  });
}

function switchPlayer() {
  striker.vx = 0;
  striker.vy = 0;
  if (currentPlayer === 1) {
    currentPlayer = 2;
  } else {
    currentPlayer = 1;
  }
  striker_place();
}

function coinGoal(coin) {
  let goal = [
    { x: 35, y: 35 },
    { x: 35, y: 685 },
    { x: 685, y: 35 },
    { x: 685, y: 685 },
  ];
  let radius = 18;

  for (let i = 0; i < goal.length; i++) {
    let jarak = Math.sqrt((coin.x - goal[i].x) ** 2 + (coin.y - goal[i].y) ** 2);
    if (jarak < radius) {
      return true;
    }
  }
  return false;
}

function detectObjectStop() {
  if (striker.vx != 0 && striker.vy != 0) {
    return false;
  }
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].vx != 0 && coins[i].vy != 0) {
      return false;
    }
  }
  return true;
}

function stopObj(obj) {
  if (Math.abs(obj.vx) < 0.3 && Math.abs(obj.vy) < 0.3) {
    obj.vx = 0;
    obj.vy = 0;
  }
  // stop object jika sudah mendekati 0
}
