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
    return row
  }

  /*
  Parse the input to separate each affected table by finding impex header lines and parsing until the next header line
  */
  function separateData(lines) {
    var tableDataObjects = [];
    var data = null;
    for (var i = 0, len = lines.length; i < len; i++) {
      var line = lines[i].trim();
      if (line.length === 0 || line[0] == "#" || line[0] == "$") {
        // ignore empty lines comments and variable definitions
        continue;
      }
      if (line.indexOf("INSERT") > -1 || line.indexOf("UPDATE") > -1 || line.indexOf("REMOVE") > -1) {
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
    return tableDataObjects;
  }

  function refresh(input, filename) {
    var lines = input.split("\n");
    var tables = separateData(lines);
    result.innerHTML = "";
    if (filename) {
      result.innerHTML = "<h2>" + filename + "</h2>";
    }
    for (var i = 0, len = tables.length; i < len; i++) {
      result.appendChild(renderTable(tables[i]));
    }
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
