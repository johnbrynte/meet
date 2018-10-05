var timer = (function () {

  var timer = init;

  timer.deltaTime = 0;
  timer.fixedDeltaTime = 1 / 50;
  timer.a = 0;
  timer.p = Date.now();
  timer.n = Date.now();
  timer.t = 0;

  var variablecb = function () { }, fixedcb = function () { };

  return timer;

  /////

  function init(v, f) {
    if (v) {
      variablecb = v;
    }
    if (f) {
      fixedcb = f;
    }

    loop();
  }

  function loop() {
    requestAnimationFrame(loop);
    timer.n = Date.now();
    timer.deltaTime = Math.min((timer.n - timer.p) / 1000, 1 / 4);
    timer.a += timer.deltaTime;
    timer.p = timer.n;

    while (timer.a >= timer.fixedDeltaTime) {
      timer.a -= timer.fixedDeltaTime;
      timer.t += 1;

      fixedcb(timer.fixedDeltaTime);
    }

    variablecb(timer.deltaTime);
  }

})();