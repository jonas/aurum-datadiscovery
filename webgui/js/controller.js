var ddContent = angular.module('ddContent', []).controller('contentController', ContentController);

function ContentController() {
  /*
    The files returned by the last user action. These are grouped by rows for
    visualization in the left panel.
  */
  this.rows = [
    {'files': [
      {'name': 'A',
      'schema': [
        {'name': 'id1', 'samples': ['1', '1', '1']},
        {'name': 'name1', 'samples': ['one', 'one']}
      ]},
      {'name': 'B',
      'schema': [
        {'name': 'id2', 'samples': ['2', '2', '2']},
        {'name': 'name2', 'samples': ['two', 'two', 'two']}
      ]},
      {'name': 'C',
      'schema': [
        {'name': 'id3', 'samples': ['3', '3', '3']},
        {'name': 'name3', 'samples': ['three', 'three', 'three']}
      ]},
      {'name': 'D',
      'schema': [
        {'name': 'id4', 'samples': ['0', '0', '0']},
        {'name': 'name4', 'samples': ['0', '0', '0']}
      ]}
    ]},
    {'files': [
      {'name': 'E',
      'schema': [
        {'name': 'id5', 'samples': ['0', '0', '0']},
        {'name': 'name5', 'samples': ['0', '0', '0']}
      ]},
      {'name': 'F',
      'schema': [
        {'name': 'id6', 'samples': ['0', '0', '0']},
        {'name': 'name6', 'samples': ['0', '0', '0']}
      ]},
      {'name': 'G',
      'schema': [
        {'name': 'id7', 'samples': ['0', '0', '0']},
        {'name': 'name7', 'samples': ['0', '0', '0']}
      ]},
      {'name': 'H',
      'schema': [
        {'name': 'id8', 'samples': ['0', '0', '0']},
        {'name': 'name8', 'samples': ['0', '0', '0']}
    ]}
    ]
    },
    {'files': [
      {'name': 'I',
      'schema': [
        {'name': 'id9', 'samples': ['0', '0', '0']},
        {'name': 'name9', 'samples': ['0', '0', '0']}
      ]},
      {'name': 'J',
      'schema': [
        {'name': 'id10', 'samples': ['0', '0', '0']},
        {'name': 'name10', 'samples': ['0', '0', '0']}
      ]},
      {'name': 'K',
      'schema': [
        {'name': 'id11', 'samples': ['0', '0', '0']},
        {'name': 'name11', 'samples': ['0', '0', '0']}
      ]}
    ]
    }
  ];

  /*
    The content shown in the right panel, associated to a given file
  */
  this.schema = [

  ];

  this.selectedFile;
  this.selectedColumn;
}

/*
  On file click, we change the schema that is shown
*/
ContentController.prototype.setSchema = function (filename) {
  this.selectedColumn = null;
  this.selectedFile = filename;
  for(var i = 0; i<this.rows.length; i++) {
    var files = this.rows[i].files;
    for(var j = 0; j<files.length; j++) {
      var file = files[j];
      if(file.name == filename) {
        this.schema = file.schema;
      }
    }
  }
};

/*
  On schema.column click, we show some samples of the values
*/
ContentController.prototype.showSamples = function (colname) {
  for(var i = 0; i<this.schema.length; i++) {
    var col = this.schema[i];
    if(col.name == colname) {
      var samples = col.samples;
      alert(samples);
    }
  }
};

ContentController.prototype.selectColumn = function (colname) {
  console.log("selected: " + colname);
  this.selectedColumn = colname;
};

ContentController.prototype.keywordSearch = function (keyword) {
  console.log("searching: " + keyword);
}

ContentController.prototype.colSim = function () {
  if(this.selectedFile == 'undefined' || this.selectedFile == null
  || this.selectedColumn == 'undefined' || this.selectedColumn == null) {
    alert("SELECT a file and a column FIRST");
    return;
  }
  key = {'filename': this.selectedFile, 'columname': this.selectedColumn};
  console.log("show similar to: " );
  console.log(key);
};

ContentController.prototype.colOve = function () {
  if(this.selectedFile == 'undefined' || this.selectedFile == null
  || this.selectedColumn == 'undefined' || this.selectedColumn == null) {
    alert("SELECT a file and a column FIRST");
    return;
  }
  key = {'filename': this.selectedFile, 'columname': this.selectedColumn};
  console.log("show overlap to: ");
  console.log(key);
};
