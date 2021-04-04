//obiekty DOM vs HTML - czy są w pamięci?

$(document).ready(function() {

  var apiRoot = 'https://mighty-island-97230.herokuapp.com//v1/task/';
  var datatableRowTemplate = $('[data-datatable-row-template]').children()[0];
  var tasksContainer = $('[data-tasks-container]');

  // init
getAllTasks();
  
  //pytania - parametr, metoda val()
  //OK
  function createElement(data) {
    var element = $(datatableRowTemplate).clone();

    element.attr('data-task-id', data.id);
    element.find('[data-task-name-section] [data-task-name-paragraph]').text(data.title);
    element.find('[data-task-name-section] [data-task-name-input]').val(data.title);

    element.find('[data-task-content-section] [data-task-content-paragraph]').text(data.content);
    element.find('[data-task-content-section] [data-task-content-input]').val(data.content);

    return element;
  }

  //parametr data - to nasz task? potem pętla przyjmuje paramter task
  //data to odpowiedź z serwera, za pomocą jQuery to się wykonuje?
  function handleDatatableRender(data) {
    tasksContainer.empty();
    data.forEach(function(task) {
      createElement(task).appendTo(tasksContainer);
    });
  }

  function getAllTasks() {
    var requestUrl = apiRoot + 'getTasks';

    $.ajax({
      url: requestUrl,
      method: 'GET',
        success: handleDatatableRender
     });
  }

  function handleTaskUpdateRequest() {
    var parentEl = $(this).parent().parent();
    //ponizej int
    var taskId = parentEl.attr('data-task-id');
    //ponizej string ale sprawdż na DOM jak to wygląda zeby mieć 100%
    var taskTitle = parentEl.find('[data-task-name-input]').val();
    //ponizej string
    var taskContent = parentEl.find('[data-task-content-input]').val();
    var requestUrl = apiRoot + 'updateTask';

    $.ajax({
      url: requestUrl,
      method: "PUT",
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        id: taskId,
        title: taskTitle,
        content: taskContent
      }),
      success: function(data) {
        //poniżej zmienia akualny stan klasy na tę w metodzie .toggleClass tylko dlaczego z .attr
        parentEl.attr('data-task-id', data.id).toggleClass('datatable__row--editing');
        //poniżej zwrócony będzie String i zapisany w dzieciach parentEl z klasą name-paragrpah
        parentEl.find('[data-task-name-paragraph]').text(taskTitle);
        parentEl.find('[data-task-content-paragraph]').text(taskContent);
      }
    });
  }

  function handleTaskDeleteRequest() {
    var parentEl = $(this).parent().parent(); //idziemy do obiektu form z klasą datable__row
    var taskId = parentEl.attr('data-task-id'); //pobieramy inta id - np 3
    var requestUrl = apiRoot + 'deleteTask';

    $.ajax({
      url: requestUrl + '/?' + $.param({
        //tutaj pytanie jak to param to zapytanie zwróci zeby potem kontatancje zrobic
        taskId: taskId
      }),
      method: 'DELETE',
      //powyżej na poziomie bazy dnaych poniżej na poziomie DOM
      success: function() {
        parentEl.slideUp(400, function() { parentEl.remove(); });
      }
    })
  }

  function handleTaskSubmitRequest(event) {
    //nie jasny ten event jako parametr
    event.preventDefault();

    var taskTitle = $(this).find('[name="title"]').val();
    //czym ten this bo rozumiem, pobieramy do zeminnych stringi z tytułem i opisem nowego taska
    var taskContent = $(this).find('[name="content"]').val();

    var requestUrl = apiRoot + 'createTask';

    $.ajax({
      url: requestUrl,
      method: 'POST',
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        title: taskTitle,
        content: taskContent
      }),
      complete: function(data) {
        if(data.status === 200) {
          getAllTasks();
        }
        //jako complete funkcja, która pobiera raz jeszcze taski aby wyswlietlic wszystko na DOM
        //jesli status data jest 200
        //ta data to jest cała komunikacja z serwera
     }
    });
  }
  //edit działa na paragrafach na DOM a update na input`ach
  function toggleEditingState() {
    var parentEl = $(this).parent().parent();
    //twa węzły do góry, do klasy datable-row
    parentEl.toggleClass('datatable__row--editing');

    var taskTitle = parentEl.find('[data-task-name-paragraph]').text();
    var taskContent = parentEl.find('[data-task-content-paragraph]').text();

    parentEl.find('[data-task-name-input]').val(taskTitle);
    //pobieramy Stringa metodą text i z powrotem przekazujemy tego Stringa?
    parentEl.find('[data-task-content-input]').val(taskContent);
  }

  $('[data-task-add-form]').on('submit', handleTaskSubmitRequest);

  tasksContainer.on('click','[data-task-edit-button]', toggleEditingState);
  tasksContainer.on('click','[data-task-edit-abort-button]', toggleEditingState);
  tasksContainer.on('click','[data-task-submit-update-button]', handleTaskUpdateRequest);
  tasksContainer.on('click','[data-task-delete-button]', handleTaskDeleteRequest);
  //.on()- uchwyt na eventhandlers na danym elemencie- obiekcie JQuery

});