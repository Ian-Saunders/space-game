const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const rank1 = document.querySelector("#rank1");
const rank2 = document.querySelector("#rank2");
const rank3 = document.querySelector("#rank3");
const rank4 = document.querySelector("#rank4");
const rank5 = document.querySelector("#rank5");
const rank6 = document.querySelector("#rank6");
const rank7 = document.querySelector("#rank7");
const rank8 = document.querySelector("#rank8");
const rank9 = document.querySelector("#rank9");
const rank10 = document.querySelector("#rank10");

canvas.width = innerWidth;
canvas.height = innerHeight;
document.body.appendChild(canvas);
var rect = canvas.getBoundingClientRect();

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');
const bombsEl = document.querySelector('#bombsEl');
const fpsEl = document.querySelector('#fpsEl');

var seed = 1337 ^ 0xDEADBEEF; // 32-bit seed with optional XOR value
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}
// Pad seed with Phi, Pi and E.
// https://en.wikipedia.org/wiki/Nothing-up-my-sleeve_number
var rand = sfc32(0x9E3229B9, 0x243F6AB8, 0xB7E1F162, seed);
//for (var i = 0; i < 55; i++) console.log('rand = ' + rand());

let debug = 0;
let highscore = 0;
let setListeners = 0;

firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    console.log(errorCode, errorMessage);
  });

  function createName() {
    const prefix = randomFromArray([
      "COOL",
      "SUPER",
      "HIP",
      "SMUG",
      "COOL",
      "SILKY",
      "GOOD",
      "SAFE",
      "DEAR",
      "DAMP",
      "WARM",
      "RICH",
      "LONG",
      "DARK",
      "SOFT",
      "BUFF",
      "DOPE",
    ]);
    const animal = randomFromArray([
      "BEAR",
      "DOG",
      "CAT",
      "FOX",
      "LAMB",
      "LION",
      "BOAR",
      "GOAT",
      "VOLE",
      "SEAL",
      "PUMA",
      "MULE",
      "BULL",
      "BIRD",
      "BUG",
    ]);
    return `${prefix}${animal}`;
  }

//let rank = 0
// let playerName = 'DREAM';
// let score = 0;
// let highScoreArray = [
//     {playerName, score},
//     {playerName, score},
//     {playerName, score},
//     {playerName, score},
//     {playerName, score},
//     {playerName, score},
//     {playerName, score},
//     {playerName, score},
//     {playerName, score},
//     {playerName, score},
// ]
// uncomment this and run to reset highscores in database
//saveHighscores()
var tabFocus = 1;
function checkTabFocused() {
    if (document.visibilityState === 'visible') {
        //console.log('✅ browser tab has focus');
        if (tabFocus == 0) {
            if (setSpawners == 0) {
                spawnEnemies();
                spawnPowerups(); 
                setSpawners = 1;
            }
            tabFocus = 1;
        }
    } else {
        //console.log('⛔️ browser tab does NOT have focus');
        tabFocus = 0;
        //clearInterval(intervalId);
        //clearInterval(intervalIdPowerup);
    }
}
  
function gameLoop() {
    init();
    callBack();
    if (setSpawners == 0) {
        setSpawners = 1;
        spawnEnemies();
        spawnPowerups();
        setSpawners = 1;
    }
    //gameLoop();
    modalEl.style.display = 'none';
    //console.log(' we made it to gameLoop....');
}

function touchToMouse(){
    var mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function playerFire() {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {x: Math.cos(angle) * 200, y: Math.sin(angle) * 200}

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 4, 'white', velocity))
    sfx.fire.play()
    if (IsOverPlayer(event.clientX, event.clientY) && bomb > 0) {
        bomb -= 1
        bombsEl.innerHTML = bomb
        for (let i = 0; i < 36; i++) {
            const angle = (i * 10) * (Math.PI / 180)
            const velocity = {x: Math.cos(angle) * 200, y: Math.sin(angle) * 200}
            projectiles.push(new Projectile(player.x, player.y, 4, 'white', velocity))
        }
        for (let i = 0; i < 36; i++) {
            const angle = (i * 10) * (Math.PI / 180)
            const velocity = {x: Math.cos(angle) * 150, y: Math.sin(angle) * 150}
            projectiles.push(new Projectile(player.x, player.y, 4, 'white', velocity))
        }
    }
}

function getNewName() {
    const newName = e.target.value || createName();
    playerNameInput.value = newName;
}
  
function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
    return `${x}x${y}`;
}

function getHighScoreArray() {
    //We don't look things up by key here, so just return an x/y
    return highScoreArray;
}

function saveHighscores() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          //You're logged in!
          highScoreArray = getHighScoreArray();     
          firebase.database().ref(`highscores/`).set({
            highScoreArray
          })
        } else {
          //You're logged out.ore())
        }
    })
}

function loadHighscores() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          //You're logged in!
          firebase.database().ref(`highscores/`).on('value', function(snapshot) {
            snapshot.forEach(function(get_highscores) {
                highScoreArray = get_highscores.val();
                console.log(highScoreArray);
                setHighScoreHTML();
            })
          })
        } else {
          //You're logged out.
        }
    })
}

function setHighScoreHTML() {
    // set highScoreArray
    rank1.innerHTML = highScoreArray[0].playerName + " - " + highScoreArray[0].score
    rank2.innerHTML = highScoreArray[1].playerName + " - " + highScoreArray[1].score
    rank3.innerHTML = highScoreArray[2].playerName + " - " + highScoreArray[2].score
    rank4.innerHTML = highScoreArray[3].playerName + " - " + highScoreArray[3].score
    rank5.innerHTML = highScoreArray[4].playerName + " - " + highScoreArray[4].score
    rank6.innerHTML = highScoreArray[5].playerName + " - " + highScoreArray[5].score
    rank7.innerHTML = highScoreArray[6].playerName + " - " + highScoreArray[6].score
    rank8.innerHTML = highScoreArray[7].playerName + " - " + highScoreArray[7].score
    rank9.innerHTML = highScoreArray[8].playerName + " - " + highScoreArray[8].score
    rank10.innerHTML = highScoreArray[9].playerName + " - " + highScoreArray[9].score
}

const playerNameInput = document.querySelector("#player-name");
var myvalue = createName();
document.getElementById('player-name').setAttribute('value', myvalue);
const levelColours = [0, 60, 120, 150, 180, 210, 240, 270, 300, 330];
const playerColours = ["blue", "red", "orange", "yellow", "green", "purple"];

function checkScore() {  
    for (var i = 0 ; highScoreArray.length - 1 ; i++) {
        if (i <= 9) {
            if (score >= highScoreArray[i].score) {
                playerName = playerNameInput.value;
                playerName = playerName.replace(/[^a-z0-9]/gi, '');
                highScoreArray.push({playerName, score});
                highScoreArray.sort((a, b) => a.score > b.score ? -1 : 1);
                if (highScoreArray.length > 10) {
                    highScoreArray.pop();
                };
                saveHighscores();
                setHighScoreHTML();
                break;
            }
        } else {
            break;
        }
    }
}

// sfx
var sfx = {
    fire: new Howl({
        src: [
            '/sfx/laser4.mp3', 
        ],
        loop: false,
        volume: 0.5,
        html5: true
    }),
    explo: new Howl({
        src: [
            '/sfx/explo5.mp3'
        ],
        loop: false,
        volume: 0.5,
        html5: true
    })   
}

class Player {
    constructor (x, y, radius, colour) {
        this.x = x
        this.y = y
        this.radius = radius
        this.colour = colour
    }

    draw() {
        var angle = 0 * Math.PI / 180;
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.colour
        c.fill()
        // var radialX = this.x + 64 * Math.cos(angle);
        // var radialY = this.y + 64 * Math.sin(angle);
        // c.beginPath()
        // c.arc(radialX, radialY, this.radius, 0, Math.PI * 2, false)
        // c.fillStyle = 'red'
        // c.fill()         
    }
}

class Projectile {
    constructor (x, y, radius, colour, velocity, hit = 0) {
        this.x = x
        this.y = y
        this.radius = radius
        this.colour = colour
        this.velocity = velocity
        this.hit = hit
    }

    draw() {
        //var angle = 90 * Math.PI / 180;
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.colour
        c.fill()       
    }

    update(dt) {
        this.x += this.velocity.x * dt
        this.y += this.velocity.y * dt
    }
}

class Enemy {
    constructor (x, y, radius, colour, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.colour = colour
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.colour
        c.fill()
    }
    
    update(dt) {
        this.x += this.velocity.x * dt
        this.y += this.velocity.y * dt
    }
}

class Powerup {
    constructor (x, y, radius, colour, velocity, hit = 0) {
        this.x = x
        this.y = y
        this.radius = radius
        this.colour = colour
        this.velocity = velocity
        this.energy = 6
        this.hit = hit
    }

    draw() {
        c.beginPath()  
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.colour
        c.fill()
    }

    update(dt) {
        if (this.energy <= 1) {
            this.colour = 'purple'
            this.radius = 6
            this.velocity.x *= 1.1
            this.velocity.y *= 1.1
        }
        this.x += this.velocity.x * dt
        this.y += this.velocity.y * dt
        console.log('dt = ' + dt)
    }
}

const friction = 0.99;
class Particle {
    constructor (x, y, radius, colour, velocity, type = 0, alpha = 1) {
        this.x = x
        this.y = y
        this.radius = radius
        this.colour = colour
        this.velocity = velocity
        this.alpha = alpha
        this.type = type
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.colour
        c.fill()
        c.restore()
    }

    update(dt) {
        if (this.type == 0) {
            this.velocity.x *= friction
            this.velocity.y *= friction
            this.x += this.velocity.x * dt
            this.y += this.velocity.y * dt 
            if (this.alpha - 0.01 > 0) {
                this.alpha -= 0.01
            } else {
                this.alpha = 0
            }          
        } else if (this.type == 1) {
            this.velocity.x *= 1.05
            this.velocity.y *= 1.05
            this.x += this.velocity.x * dt
            this.y += this.velocity.y * dt 
            if (this.alpha - 0.01 > 0) {
                this.alpha -= 0.01
            } else {
                this.alpha = 0
            }
        } else if (this.type == 2) {
            this.velocity.x = (Math.random() - 0.5) * 500
            this.velocity.y = (Math.random() - 0.5) * 500
            this.x += this.velocity.x * dt
            this.y += this.velocity.y * dt
            if (this.alpha - 0.01925 > 0) {
                this.alpha -= 0.01925
            } else {
                this.alpha = 0
            }
        }
    }
}

var x = canvas.width / 2;
var y = canvas.height / 2;
let player = new Player (x, y, 20, (randomFromArray(playerColours)));
let bomb = 0;
var level = 1;
let projectiles = [];
projectiles.length = 0;
let enemies = [];
enemies.length = 0;
let powerups = [];
powerups.length = 0;
let particles = [];
particles.length = 0;
let levelcolour = randomFromArray(levelColours);

//Misc Helpers
function init() {
    player = new Player (x, y, 20, (randomFromArray(playerColours)))
    projectiles = []
    projectiles.length = 0
    enemies = []
    enemies.length = 0
    powerups = []
    powerups.length = 0
    particles = []
    particles.length = 0
    if (score > highscore) highscore = score
    highScoreEl.innerHTML = highscore
    score = 0
    scoreEl.innerHTML = score
    levelcolour = randomFromArray(levelColours) 
    loadHighscores()  
    setHighScoreHTML()
    level = 1
    // add more bombs to test
    bomb = 0
    bombsEl.innerHTML = bomb
    tabFocus = 1
    addListeners()
}
init();

function IsOverPlayer(x, y) {
    //if mouse over the player circle return true
    if (((x - canvas.width / 2) * (x - canvas.width / 2)) + ((y - canvas.height / 2) * (y - canvas.height / 2)) < (player.radius*player.radius)) {
        return true;
    } else {
        return false;
    }
}

var intervalId
function spawnEnemies() {
    intervalId = setInterval(()=> {
        var templevel = Math.trunc(1 + level/8)
        //templevel = 1;
        //console.log('templevel = ' + templevel)
        for (var i = 0 ; i < templevel ; i++) {
            const radius = Math.random() * (150 - 80) + 80
            let x
            let y
            if (Math.random() > 0.5){
                x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius
                y = Math.random() * canvas.height 
            } else {
                x = Math.random() * canvas.width
                y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius
            }
            const colour = `hsl(${levelcolour + (Math.random(80 - 40) + 40  ) * 64}, 75%, 75%)`
            const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
            const velocity = {x: (Math.cos(angle)*(4 + (templevel * 20))), y: (Math.sin(angle)*(4 + (templevel * 20)))}  
            if (tabFocus == 1) enemies.push(new Enemy(x, y, radius, colour, velocity))
        }
    }, 8000)
}

var intervalIdPowerup
function spawnPowerups() {
    //console.log('we made it to spaw powerups......')
    intervalIdPowerup = setInterval(()=> {     
        const radius = 20
        let x
        let y
        if (Math.random() > 0.5){
            x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height 
        } else {
            x = Math.random() * canvas.width
            y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius
        }
        const colour = `hsl(60, 100%, 50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        //console.log('angle = ' + angle)
        const velocity = {x: Math.cos(angle) * 100, y: Math.sin(angle) * 100}  
        //console.log('vel x = ' + velocity.x + ' vel y = ' + velocity.y)
        if (tabFocus == 1) powerups.push(new Powerup(x, y, radius, colour, velocity))
    }, 6000)
}

//let callBack
var height = document.documentElement.clientHeight;
var width  = document.documentElement.clientWidth;
let dt = 0;

function update(dt) {
    //console.log('updating.....');
    /* Resize canvas on every frame */
    var height = document.documentElement.clientHeight;
    var width  = document.documentElement.clientWidth;    
    c.canvas.height = height;
    c.canvas.width  = width;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    var projectileCount = 0;
    projectiles.forEach((projectile, index)=> {
        projectile.update(dt);
        // remove from edges of screen
        if (projectile.x - projectile.radius < -100 || 
            projectile.x + projectile.radius > canvas.width + 100 ||
            projectile.y - projectile.radius < -100 ||
            projectile.y + projectile.radius > canvas.height + 100 ||
            projectile.hit == 1
            ) {
        setTimeout(() => {
            projectiles.splice(index, 1);  
        }, 0)
        }
        projectileCount += 1;
    });
    if (debug == 1) console.log('projectiles = ' + projectileCount)
    var particleCount = 0;
    particles.forEach((particle, index)=> {
        if (particle.x - particle.radius < -100 || 
            particle.x + particle.radius > canvas.width + 100 ||
            particle.y - particle.radius < -100 ||
            particle.y + particle.radius > canvas.height + 100 ||
            particle.alpha <= 0) {
            setTimeout(() => {
                particles.splice(index, 1);
            }, 0)
        } else {
           particle.update(dt);
        } 
        particleCount += 1;
    }) 
    if (debug == 1) console.log('particles = ' + particleCount)
    var enemyCount = 0;
    enemies.forEach((enemy, index) => {
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        // end game
        if (dist - enemy.radius - player.radius < 1) {
            //console.log('we made it to check score.......')
            checkScore();
            clearInterval(intervalId);
            clearInterval(intervalIdPowerup);
            setSpawners = 0;
            bigScoreEl.innerHTML = score;
            modalEl.style.display = 'flex';
            removeListeners();
            cancelAnimationFrame(callBack);
            init();
        }

        projectiles.forEach((projectile) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // when projectiles touch enemy
            if (dist - enemy.radius - projectile.radius < 1 && projectile.hit == 0) {
                // create explosions
                for (let i = 0; i < 30 ; i++) {
                    particles.push(new Particle(enemy.x, enemy.y, Math.random() * 4, enemy.colour, {x: (Math.random() - 0.5) * 400 + projectile.velocity.x/2, y: (Math.random() - 0.5) * 400 + projectile.velocity.y/2}, 0))
                }
                sfx.explo.play()
                if (enemy.radius - 20 > 20) {
                    // increase score
                    score += 100
                    scoreEl.innerHTML = score
                    gsap.to(enemy, {
                    radius: enemy.radius - 20
                    })
                } else {
                    // increase score
                    score += 250
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1)  
                    }, 0)                    
                }  
                projectile.hit = 1
            }
        }) 
        enemy.update(dt)  
        enemyCount += 1;   
    });  
    if (debug == 1) console.log('enemies = ' + enemyCount)
    var powerupCount = 0;
    powerups.forEach((powerup, pwrindex) => {        
        const dist = Math.hypot(player.x - powerup.x, player.y - powerup.y)

        projectiles.forEach((projectile) => {
            const dist = Math.hypot(projectile.x - powerup.x, projectile.y - powerup.y)

            // when projectiles touch powerup
            if (dist - powerup.radius - projectile.radius < 1 && projectile.hit == 0) {
                   
                // create explosions
                for (let i = 0; i < 20 ; i++) {
                    particles.push(new Particle(powerup.x, powerup.y, Math.random() * 2, powerup.colour, {x: (Math.random() - 0.5) * 400 + projectile.velocity.x/2, y: (Math.random() - 0.5) * 400 + projectile.velocity.y/2}, 0))
                }
                sfx.explo.play()

                // increase score
                score += 5000
                scoreEl.innerHTML = score
                if (powerup.energy > 1) {
                    powerup.energy -= 1
                }
                powerup.hit = 1 
                if (powerup.hit == 0) projectile.hit = 1             
            }           
        })
        // hit powerup get score
        if (dist - powerup.radius - player.radius < 1) {
            for (let i = 0; i < 68 ; i++) {
                particles.push(new Particle(player.x, player.y, Math.random() * (20 - 6) + 6, powerup.colour, {x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 80}, 2))
            }
            score += 25000
            scoreEl.innerHTML = score
            if (powerup.energy <= 1) {
                bomb +=1
                bombsEl.innerHTML = bomb
            }
            setTimeout(() => {
                powerups.splice(pwrindex, 1)  
            }, 0)                    
        }
        powerup.update(dt)
        powerupCount += 1;
    });  
    if (debug ==1) console.log('powerupCount = ' + powerupCount)
    level += 0.001 
    // create star background
    if (Math.random() > 0.75) {
        const angle = Math.random() * 360
        const velocity = {x: Math.cos(angle) * 200, y: Math.sin(angle) * 200}
        const rnd = Math.random() * 2
        for (let i = 0; i < rnd*3 ; i++) {
            particles.push(new Particle(canvas.width / 2, canvas.height / 2, rnd, 'grey', velocity, 1))
        }
    }          
}

function render() {
    //console.log('rendering.....');
    c.fillStyle = 'rgba(0, 0, 0, 0.2'
    c.fillRect(0, 0, canvas.width, canvas.height)
    
    projectiles.forEach((projectile)=> {
        projectile.draw()
    })
    particles.forEach((particle)=> {
        particle.draw()
    })       
    enemies.forEach((enemy) => {
        enemy.draw()
    })           
    powerups.forEach((powerup) => {  
        powerup.draw()
    }) 
    player.draw()         
}

//let timeStamp = Date.now();
var isPaused = false;
var time = new Date();
var offset = 0;
var setSpawners = 0;
//function gameLoop() {
let secondsPassed = 0;
let oldTimeStamp = 0;
let fps;
if (setSpawners == 0) {
    setSpawners = 1;
    spawnEnemies();
    spawnPowerups();
    setSpawners = 1;
}
const callBack = (timeStamp) => {
    // Calculate the number of seconds passed since the last frame
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    // Move forward in time with a maximum amount
    secondsPassed = Math.min(secondsPassed, 0.1);
    oldTimeStamp = timeStamp;
    // Calculate fps
    fps = Math.round(1 / secondsPassed);
    fpsEl.innerHTML = fps
    if (debug == 1) console.log('fps = ' + fps); 
    if (tabFocus == 1) update(secondsPassed); 
    if (tabFocus == 1) render(); 
    requestAnimationFrame(callBack);          
}        
    //callBack();
//}

// uncomment to skip main menu
// window.onload = function() {
//     modalEl.style.display = 'none';
//     init();
//     spawnEnemies();
//     spawnPowerups();
//     gameLoop();
// }


function addListeners() {
    if (setListeners == 0) {
        // Set up touch events for mobile, etc
        canvas.addEventListener("click touchstart", touchToMouse, false);
        // Set up Mouse Click Events
        startGameBtn.addEventListener('click', gameLoop)
        canvas.addEventListener('click', playerFire)
        // Set up Player Name Change
        playerNameInput.addEventListener("change", getNewName)
        document.addEventListener('visibilitychange', checkTabFocused);
        setListeners = 1;
    }
}
function removeListeners() {
    if (setListeners == 1) {
        // Remove listeners
        canvas.removeEventListener("click touchstart", touchToMouse, false);
        startGameBtn.removeEventListener('click', gameLoop)
        canvas.removeEventListener('click', playerFire)
        playerNameInput.removeEventListener("change", getNewName)
        document.removeEventListener('visibilitychange', checkTabFocused);
        setListeners = 0;
    }
}

