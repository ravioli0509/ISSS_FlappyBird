// SELECT CVS
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

let frames = 0;
const DEGREE = Math.PI/180;

const sprite = new Image();
sprite.src = "img/sprite.png";

const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

const numOne= new Image();
numOne.src = "img/num_one.png"

const numTwo = new Image();
numTwo.src = "img/num_two.png"

const icon = new Image();
icon.src = "img/icon.png"

const WRONG = new Audio();
WRONG.src = "audio/wrong.wav";

const cross = new Image();
cross.src = "img/wrong.png"

let strikes = 0

let pipe_id = 0

const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

const startBtn = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

let questions = []

window.addEventListener("keydown", function(evt){
    if (evt.keyCode == 32) {
        if (state.current == state.getReady) {
            fetch('flappy_questions.txt')
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n')
                for (row of rows) {
                    line = row.split(',')
                    questions.push({
                        q: line[0],
                        a: line[1],
                        w: line[2]
                    })
                }
                questions = shuffle(questions, Math.floor(Math.random() * 100) + 1)
            });
        }
        switch(state.current){
            case state.getReady:
                state.current = state.game;
                SWOOSHING.play();
                break;
            case state.game:
                if(bird.y - bird.radius <= 0) return;
                bird.flap();
                FLAP.play();
                break;
            case state.over:
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
                let message = document.getElementById("congrats")
                message.innerHTML = ""
                break;
        }
    }

});

function shuffle(array, seed) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    seed = seed || 1;
    let random = function() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    while (0 !== currentIndex) {
      randomIndex = Math.floor(random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    
    dx : 2,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }
}

const bird = {
    animation : [
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,
    
    radius : 12,
    
    frame : 0,
    
    gravity : 0.25,
    jump : 4.6,
    speed : 0,
    rotation : 0,
    
    draw : function(){
        let bird = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap : function(){
        this.speed = - this.jump;
    },
    
    update: function(){
        // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frames%this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 To 4, THEN AGAIN TO 0
        this.frame = this.frame%this.animation.length;
        
        if(state.current == state.getReady){
            this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
            this.rotation = 0 * DEGREE;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            
            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y = cvs.height - fg.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                    DIE.play();
                }
            }
            
            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            }else{
                this.rotation = -25 * DEGREE;
            }
        }
        
    },
    speedReset : function(){
        this.speed = 0;
    }
}

const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,
    
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
    
}

// GAME OVER MESSAGE
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,
    
    draw: function(){
        let question = document.getElementById("qs");
        let answer_1 = document.getElementById("a1");
        let answer_2 = document.getElementById("a2");
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
            ctx.drawImage(icon, 75, 175)
            pipe_id = 0
            questions = []
            question.innerHTML = ""   
            answer_1.innerHTML = ""
            answer_2.innerHTML = ""
        }
    }
    
}

const cross_strike = {
    x: 75,
    y: 100,

    draw: function() {
        ctx.drawImage(cross, this.x, this.y)
    }
}

const numbers = {
    twoY: 250,
    oneY: 60,
}


const pipes = {
    position : [],
    
    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },
    middle : {
        h: 80,
        dy: 145
    },
    coin: {
        w: 40,
        h: 48
    },
    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,

    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h/2);  
            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  

            // middle pipe 
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, this.middle.dy, this.w, this.middle.h);
            ctx.drawImage(numTwo, p.x, numbers.twoY)
            ctx.drawImage(numOne, p.x, numbers.oneY)
            if (strikes == 1) {
                ctx.drawImage(cross, 190, 10)
                ctx.save()
            } 
            if (strikes == 2) {
                ctx.drawImage(cross, 190, 10)
                ctx.drawImage(cross, 230, 10)
                ctx.save()
            }
            if (strikes == 3) {
                ctx.drawImage(cross, 190, 10)
                ctx.drawImage(cross, 230, 10)
                ctx.drawImage(cross, 270, 10)
                ctx.save()
            }
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        if(frames%200 == 0){
            let correct_answer = Math.floor(Math.random() * 2) + 1
            let question = document.getElementById("qs");
            let answer_1 = document.getElementById("a1");
            let answer_2 = document.getElementById("a2");
            if(correct_answer == 1){
                question.innerHTML = "Question: " + questions[pipe_id].q + "?"    
                answer_1.innerHTML = "1: " + questions[pipe_id].a
                answer_2.innerHTML = "2: " + questions[pipe_id].w

            } else {
                question.innerHTML = "Question: " + questions[pipe_id].q + "?"
                answer_1.innerHTML = "1: " + questions[pipe_id].w
                answer_2.innerHTML = "2: " + questions[pipe_id].a
            }
            this.position.push({
                x : cvs.width,
                y : this.maxYPos,
                answer: correct_answer,
                isCorrect: true
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h/2){
                state.current = state.over;
                HIT.play();
            }
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
                state.current = state.over;
                HIT.play();
            }

            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > this.middle.dy && bird.y - bird.radius < this.middle.dy + this.middle.h) {
                state.current = state.over;
                HIT.play();
            }

            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.coin.w && bird.y + bird.radius > numbers.oneY && bird.y - bird.radius < numbers.oneY + this.coin.h && p.answer == 2) {
                p.isCorrect = false
            }

            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.coin.w && bird.y + bird.radius > numbers.twoY && bird.y - bird.radius < numbers.twoY + this.coin.h && p.answer == 1) {
                p.isCorrect = false
            }
            p.x -= this.dx;
            if(p.x + this.w <= 0){
                this.position.shift();
                pipe_id++;
                if (p.isCorrect) {
                    score.value += 1;
                    SCORE_S.play();
                    score.best = Math.max(score.value, score.best);
                    localStorage.setItem("best", score.best);
                } else {
                    strikes += 1
                    cross_strike.draw()
                    WRONG.play();
                }
                if (pipe_id == questions.length) {
                    let message = document.getElementById("congrats")
                    message.innerHTML = "Congrats! You Passed All The Pipes"
                    state.current = state.over
                }
            }
            if (strikes == 3) {
                state.current = state.over
                HIT.play()
            }
        }
        
    },
    
    reset : function(){
        this.position = [];
    }
    
}

// SCORE
const score= {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
            
        }else if(state.current == state.over){
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    
    reset : function(){
        this.value = 0;
        strikes = 0
    }
}

function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// UPDATE
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

// LOOP
function loop(){
    update();
    draw();
    frames++;
    
    requestAnimationFrame(loop);
}
loop();
