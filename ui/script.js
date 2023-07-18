// access the pre-bundled global API functions
const { invoke } = window.__TAURI__.tauri

var $TABLE = $('#table');
var $BTN = $('#export-btn');
var $EXPORT = $('#export');

// get current time for default start_date.
let dt = moment().format('YYYY/MM/DD');
$TABLE.find('.start_date').find('.date').text(dt)


// load data from backend.
invoke('load')
.then((response) => {
    console.log(response)
    response.forEach(line => {
        var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');

        // fill data to new document
        $clone.find('td.document_name').text(line.document_name)
        $clone.find('td.document_version').text(line.document_version)
        $clone.find('td.document_status').text(line.document_status)
        $clone.find('td.start_date').find('.date').text(line.start_date)
        let remain_date = moment(line.target_date, "YYYYMMDD").diff(moment(), "days");
        $clone.find('td.remain_date').text(remain_date)

        // highlight remain_date <= 10.
        if(remain_date <= 10){
            $clone.find('td.remain_date').css({ 'color': 'red', 'font-size': '150%' });
        }
        
        // Binds the hidden input to be used as datepicker.
        $clone.find('.datepicker-input').datepicker({
          dateFormat: 'yy/mm/dd',
          onClose: function(dateText, inst) {
              console.log(dateText)
              console.log($(this).parent().find('.date').text())
              $(this).parent().find('.date').text(dateText);
          }
        });

        // Shows the datepicker when clicking on the content editable div
        $clone.find('.date').click(function() {
        // Triggering the focus event of the hidden input, the datepicker will come up.
        $(this).parent().find('.datepicker-input').datepicker("show");
        });

        $TABLE.find('table').append($clone);
    })
    
})


// add new document.
$('.table-add').click(function () {
  var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
  // Binds the hidden input to be used as datepicker.
  $clone.find('.datepicker-input').datepicker({
    dateFormat: 'yy/mm/dd',
    onClose: function(dateText, inst) {
        console.log(dateText)
        console.log($(this).parent().find('.date').text())
        $(this).parent().find('.date').text(dateText);
    }
  });

  // Shows the datepicker when clicking on the content editable div
  $clone.find('.date').click(function() {
  // Triggering the focus event of the hidden input, the datepicker will come up.
  $(this).parent().find('.datepicker-input').datepicker("show");
  });
  $TABLE.find('table').append($clone);
});


// remove document.
$('.table-remove').click(function () {
  $(this).parents('tr').detach();
});


// move up document.
$('.table-up').click(function () {
  var $row = $(this).parents('tr');
  if ($row.index() === 1) return; // Don't go above the header
  $row.prev().before($row.get(0));
});


// move down document.
$('.table-down').click(function () {
  var $row = $(this).parents('tr');
  $row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;


// save table
$BTN.click(function () {
  var $rows = $TABLE.find('tr:not(:hidden)').not('.col_name');
  var data = [];
  
  // Turn all existing rows into a loopable array
  $rows.each(function () {
    var $td = $(this).find('td');
    var h = {};
    // Use the headers from earlier to name our hash keys
    $td.each(function (i) {
        if($td.eq(i).attr("class")){
            h[$td.eq(i).attr("class")] = $td.eq(i).text();  
        }
    });
    h["start_date"] = $(this).find('.date').text()
    h["target_date"] = moment().add((h.remain_date), 'days').add(1, 'days').format('YYYY/MM/DD');
    delete h.remain_date;
    console.log(h)
    data.push(h);
  });
  
  // save result to backend.
  invoke('save', {req: data})
});


