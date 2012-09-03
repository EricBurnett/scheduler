/* Eric Burnett, 2012.

   This class creates a global 'scheduler' object, with a Place() method for 
   injecting it into the HTML DOM rooted at the appropriate object. It requires
   that json be available in the browser as well as jquery.

   For example:
     <html>
       <head>
         <script src="json.js"></script>
         <script src="jquery.js"</script>
         <script src="scheduler.js">/script>
       </head>
       <body onload="scheduler.Place(this)"></body>
     </html>
*/
var scheduler = {};

// storage:
//   items -> Item[]
//
// Item:
//   children -> Item[]
//   text -> string
// TODO: Move into closure once not needed available for debugging.
var storage;

// Everything is defined in a closure to avoid creating global variables.
(function() {
  'use strict';

  var root;

  function Load() {
    if (localStorage.scheduler_storage) {
      storage = JSON.parse(localStorage.scheduler_storage, null);
    } else {
      storage = {'items' :
        [{'text': 'My first item'},
         {'text': 'My second item'},
         {'text': 'Three'}]};
    }
  }

  function Save() {
    localStorage.scheduler_storage = JSON.stringify(storage, null, 2);
  }

  function Refresh() {
    root.empty();
    if (storage.items == null) {
      storage.items = [];
    }
    PrintItems(root, 0, storage.items);
  }

  function PrintItems(container, level, items) {
    if (items) {
      var ul = $('<ul>').appendTo(container);
      ul.addClass("level-" + level);
      ul.addClass("item-list");
      for (var i = 0; i < items.length; ++i) {
        PrintItem(ul, level, items, i);
      }
    }

    function add() {
      var item_text = prompt("Contents", "");
      if (item_text == null) {
        // Cancel.
        return;
      }
      item_text = $.trim(item_text);
      var new_item = {'text': item_text};
      if (new_item) {
        items.push(new_item);
      } else {
        return;
      }
      Save();
      Refresh();
    }
    container.append($("<a>").text("+")
                             .attr("class", "add-button")
                             .attr("href", "#")
                             .click(add));
  }

  function PrintItem(container, level, items, index) {
    function edit() {
      var item_text = prompt("Contents (or none to remove)", items[index].text);
      if (item_text == null) {
        // Cancel.
        return;
      }
      item_text = $.trim(item_text);
      if (item_text) {
        items[index].text = item_text;
      } else {
        items.splice(index, 1);
      }
      Save();
      Refresh();
    }

    var node =
        $("<li>").text(items[index].text + " ")
                 .attr('class', 'item')
                 .append($("<a>").text("(edit)")
                                 .attr("class", "edit-button")
                                 .attr("href", "#")
                                 .click(edit));
    if (items[index].children == null) {
      items[index].children = [];
    }
    PrintItems(node, level+1, items[index].children);
    container.append(node);
  }

  scheduler.Place = function(receiver) {
    root = $(receiver);
    root.addClass("scheduler-root");
    root.append("<p>Hello world</p>");
    Load();
    Refresh();
  }
}());
