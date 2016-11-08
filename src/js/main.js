/*********************************************************
1. Install by copying all files EXCEPT node_modules folder.
2. Then type in terminal: $ sudo npm install.
3. $ grunt watch
*********************************************************/
(function($) {
  /*********************************
  Storage
  *********************************/
  console.log(localStorage);
  var allproblems = [];
  var storage = {
    set: function() {
      localStorage.setItem("currentProblem", JSON.stringify(allproblems)); // turning object into string
    },
    get: function() {
      var problem = localStorage.currentProblem === undefined ? new Game() : JSON.parse(localStorage.currentProblem);
      return problem;
    },
    clear: function() {
      localStorage.removeItem('currentProblem');
    }
  };

  /*********************************
  Game Constructor
  *********************************/
  function Game() {
    var self = this;
    this.gameContext = {
      totalScore: 0,
      currentQuestion: 1,
      won: 0,
      loss: 0
    };
    this.stats = {
      current: function() {
        self.gameContext.currentQuestion++;
        $('aside .currentQuestion span').html(self.gameContext.currentQuestion);
      },
      totalScore: function(winOrLoss) {
        if(winOrLoss === 'win') {
          self.gameContext.totalScore++;
        } else if (winOrLoss === 'loss') {
          self.gameContext.totalScore--;
        }

        $('aside .totalScore span').html(self.gameContext.totalScore);
      },
      won: function() {
        self.gameContext.won++;
        $('.won span').html(self.gameContext.won);
      },
      loss: function() {
        self.gameContext.loss++;
        $('.loss span').html(self.gameContext.loss);
      }
    };
    this.question = {};
    this.buildGame();
    this.buildQuestion();
    this.clickEvent();
    // stats and keeping up with questions - keep track of current question
  }

  Game.prototype.buildQuestion = function() {
    var self = this;
    var data;
    $.ajax({
        type: 'GET',
        crossDomain: true,
        url: 'http://jservice.io/api/random',
        dataType: 'json'
    }).done(function(response) {
        self.question = new Question(response, self.elem);
    });
  };

  Game.prototype.buildGame = function() {
      var source = $('#game').html();
      var template = Handlebars.compile(source);
      var context = this.gameContext;
      var html = template(context);

      $(html).prependTo('.container').fadeIn();
      this.elem = $('.game-container').first();
  };

  Game.prototype.clickEvent = function() {
    var self = this;
    $('form').on('submit', function(e) {
      e.preventDefault();
      var userValue = $('#userAnswer').val();
      var answer = self.question.context.answer;

      if(userValue.toLowerCase() == answer.toLowerCase()) {
        $('.main-container').css(
          'background', 'linear-gradient(#ffffff, #a8eab4)'
        ).fadeIn(2000);
        self.stats.won();
        self.stats.totalScore('win');
        $(this).find('.currentProblem').remove();
        self.nextQuestion();
      } else {
        $('.main-container').css(
          'background', 'linear-gradient(#ffffff, #ae0000)'
        ).fadeIn(2000);
        self.stats.loss();
        self.stats.totalScore('loss');
        $(this).find('.currentProblem').remove();
        self.nextQuestion();
      }
    });
  };

  Game.prototype.nextQuestion = function() {
    allproblems.push(this);
    storage.set();
    this.stats.current();
    this.buildQuestion();
  };


  /*********************************
  Question Constructor
  *********************************/
  function Question(data, parent) {
    this.context = {
      question: data[0].question,
      answer: data[0].answer
    };
    this.parent = parent;

    this.buildQuestionTemplate = function() { // creating method to prototype
      var source = $('#question').html();
      var template = Handlebars.compile(source);
      var context = this.context;
      var html = template(context);

      $(html).prependTo('form').fadeIn();
    };
    this.buildQuestionTemplate();
  }

  //localStorage Check
  // if (storage.get()) {
  //   var problems = storage.get();
  //   //console.log(problems[0].question.context);
  //
  //   //new Game(problems[0].question.context);
  // }

  var newGame = new Game();

})(jQuery);
