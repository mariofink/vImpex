(function() {

  var textInput = document.getElementById("textInput");
  var result = document.getElementById("result");

  function renderTable(data) {
    var table = document.createElement("table");
    for (var i = 0, len = data.length; i < len; i++) {
      var columns = data[i].split(";");
      if (i === 0) {
        var caption = columns.shift();
        var capEl = document.createElement("caption");
        capEl.innerHTML = caption;
        table.appendChild(capEl);
        table.appendChild(renderHeader(columns));
      } else {
        table.appendChild(renderData(columns));
      }
    }
    return table;
  }

  function renderHeader(columns) {
    var row = document.createElement("tr");
    for (var i = 0, len = columns.length; i < len; i++) {
      var colValue = columns[i];
      var cell = document.createElement("th");
      cell.innerHTML = columns[i];
      row.appendChild(cell);
    }
    return row;
  }
  function renderData(columns) {
    var row = document.createElement("tr");
    for (var i = 1, len = columns.length; i < len; i++) { // start at index 1 as all impex data lines start with ;
      var content = columns[i] || "&nbsp;";
      var cell = document.createElement("td");
      cell.innerHTML = content;
      row.appendChild(cell);
    }
    return row;
  }

  function renderIncludes(includes) {
    var container = document.createElement("section");
    var heading = document.createElement("h2");
    heading.innerHTML = "Includes";
    container.appendChild(heading);
    var list = document.createElement("ul");
    for (var j = 0, len = includes.length; j < len; j++) {
      var item = document.createElement("li");
      item.innerHTML = includes[j];
      list.appendChild(item);
    }
    container.appendChild(list);
    return container;
  }

  /*
  Parse the input to separate each affected table by finding impex header lines and parsing until the next header line
  */
  function separateData(lines) {
    var tableDataObjects = [];
    var includes = [];
    var data = null;
    for (var i = 0, len = lines.length; i < len; i++) {
      var line = lines[i].trim();
      if (line.length === 0 || line[0] == "#" || line[0] == "$") {
        // ignore empty lines comments and variable definitions
        continue;
      }
      if (line.indexOf("impex.includeExternalData") > -1) {
        includes.push(line);
        continue;
      }
      if (line.toLowerCase().indexOf("insert") > -1 || line.toLowerCase().indexOf("update") > -1 || line.toLowerCase().indexOf("remove") > -1) {
        if (data !== null) {
          tableDataObjects.push(data);
        }
        data = new Array();
        data.push(line);
      } else {
        if (data !== null) {
          data.push(line);
        }
      }
    }
    if (data !== null) {
      tableDataObjects.push(data);
    }
    return {
      tables: tableDataObjects,
      includes: includes
      };
  }

  function refresh(input, filename) {
    var lines = input.split("\n");
    var data = separateData(lines);
    var tables = data.tables;
    result.innerHTML = "";
    if (filename) {
      result.innerHTML = "<h2>" + filename + "</h2>";
    }
    for (var i = 0, len = tables.length; i < len; i++) {
      result.appendChild(renderTable(tables[i]));
    }

    result.appendChild(renderIncludes(data.includes));

  }

  function initDragAndDrop() {
    var holder = document;
    holder.ondragover = function () { return false; };
    holder.ondragend = function () { return false; };
    holder.ondrop = function (e) {
      e.preventDefault();
      var file = e.dataTransfer.files[0],
      reader = new FileReader();
      reader.onload = function (event) {
        textInput.value = "";
        refresh(event.target.result, file.name);
      };
      reader.readAsText(file);
      return false;
    };
  }

  document.getElementById("btnRefresh").addEventListener("click", function() {
    refresh(textInput.value);
  });
  initDragAndDrop();

})();
