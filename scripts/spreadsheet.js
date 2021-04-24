$(document).ready(function (){

    var rowLength = 0;
    var colLength = 0;
    var dataList = [];
    var activeCell;
    var selectedData = [];
    var selectedLetterGrades = [];
    var edit = 0;
    var prevRow = null;
    var prevCol = null;

    // fetch grades.csv and parse it
    fetch('grades.csv')
    .then((response) => response.text())
    .then(function(data){
        let lines = data.split('\n');
        rowLength = lines.length - 1;
        // call createTable and create a table then append it to the body container
        document.getElementById('table-container').appendChild(createTable(lines));
    });

    function createTable(data){
        // create the full table
        let table = document.createElement('table');
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');
        table.appendChild(thead);
        table.appendChild(tbody);
        table.id = 'table';
        table.className = 'table is-bordered';
        // input value to the table respectively 
        for (let i = 0; i < data.length; i++){
            var row = tbody.insertRow(i);
            var line = data[i].split(',');
            colLength = line.length - 1;
            for (let j = 0; j < line.length; j++){
                if (i === 0){
                    let cell = row.insertCell(j);
                    if (j === 0 ){
                        cell.id = 'ident';
                        $(cell).addClass('head');
                        cell.innerHTML = '<b>' + line[j] + '</b>';
                    } else {
                        cell.id = 'h' + (j-1).toString();
                        $(cell).addClass('head');
                        cell.innerHTML = '<b>' + line[j] + '</b>';
                    }
                } else {
                    let cell = row.insertCell(j);
                    if (j === 0){
                        cell.id = 'r' + (i-1).toString();
                        cell.innerHTML = '<b>' + line[j] + '</b>';
                        $(cell).addClass('head');
                    } else {
                        cell.id = 't' + (i-1).toString() + (j-1).toString();
                        cell.innerHTML = line[j];
                    }
                }
            }
        }
        return table;
    }

    function deselectAll(){
        // de-select previously selected rows / columns
        // get rid of the blue highlight
        $('td').removeClass('selected');
        // reset selected value array and grades
        selectedData = [];
        selectedLetterGrades = [];
        // get rid of the chart when de selected
        d3.select("svg").remove();
    }

    function selectRow(rowIndex){
        // select respective row
        if (rowIndex === prevRow){
            // if user clicks on a row which is already selected, it will de-select it for convienence
            deselectAll();
            prevRow = null;
        } else {
            // select row process, push respective values to the array
            prevRow = rowIndex;
            for (let i = 0; i < colLength; i++){
                selectedData.push(document.getElementById('t' + rowIndex.toString() + i.toString()).innerText);
                $('#t' + rowIndex.toString() + i.toString()).addClass("selected"); 
            }
            // convert the values into letters
            convertToLetter();
        }
    }

    function selectColumn(colIndex){
        // select respective column
        if (colIndex === prevCol){
            // if user clicks on a column which is already selected, it will de-select it for convienence
            deselectAll();
            prevCol = null;
        } else {
            // select column process, push respective values to the array
            prevCol = colIndex;
            for (let i = 0; i < rowLength; i++){
                selectedData.push(document.getElementById('t' + i.toString() + colIndex.toString()).innerText);
                $('#t' + i.toString() + colIndex.toString()).addClass("selected"); 
            }
            // convert the values into letters
            convertToLetter();
        }
    }

    $(document).on('click', 'td', function (){
        // check for table clicks, row clicks and column clicks
        let cellID = $(this).attr('id');
        activeHeader = cellID;
        let ident = cellID[0];
        // if the click is on a row do the following
        if (ident === 'r'){
            let row = parseInt(cellID.slice(1, cellID.length));
            console.log(row);
            console.log(cellID);
            deselectAll();
            selectRow(row);
        // if the click is on a header (column) do the following
        } else if (ident === 'h'){
            let col = parseInt(cellID.slice(1, cellID.length));
            console.log(cellID);
            deselectAll();
            selectColumn(col);
        // if the click is on a table value, generate an input field 
        } else {
            console.log(cellID);
            activeCell = cellID;
            let curValue = document.getElementById(activeCell).innerHTML;
            if (curValue[0] != '<' && !edit){
                document.getElementById(activeCell).innerHTML = '<input class="input" id="input" type="text" placeholder="'+curValue+'"></input>';
                edit = 1;
            }
        }

    });
    // check to see if ENTER is clicked, if so, replace previous table value with the new one inputted by the user
    $(document).keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            let newValue = document.getElementById('input').value;
            document.getElementById(activeCell).innerHTML = newValue;
            edit = 0;
        }
    });

    function convertToLetter(){
        // convert selected table values in array to letter grades
        for (let i = 0; i < selectedData.length; i++){
            selectedLetterGrades.push(getGrade(parseInt(selectedData[i])/10));
        }
        console.log(selectedLetterGrades);
        countOccurrence();

    }

    function countOccurrence(){
        // count the occurance of each letter grade in the selected value array and then calculate the distrubtion
        var frequencey = [
            {'grade': 'A', 'freq': 0},
            {'grade': 'B', 'freq': 0},
            {'grade': 'C', 'freq': 0},
            {'grade': 'D', 'freq': 0},
            {'grade': 'F', 'freq': 0},
        ];
        for (let i = 0; i < selectedLetterGrades.length; i++){
            for (let j = 0; j < frequencey.length; j++){
                // check for selected grades only to calculate
                if (frequencey[j].grade === selectedLetterGrades[i]){
                    // calculate the distribution
                    frequencey[j].freq += 1 / selectedLetterGrades.length;
                }
            }
        }

        // generate the d3 chart
        const margin = 80;
        const width = 500;
        const height = 500;
        const chartWidth = width - 2 * margin;
        const chartHeight = height - 2 * margin;
        // colour range
        const colourScale = d3.scaleLinear()
                            .domain([0, 1])
                            .range(['lightblue','blue']);
        // generate appropiate x scale
        const xScale = d3.scaleBand()
                        .domain(frequencey.map((data) => data.grade))
                        .range([0, chartWidth])
                        .padding(0.2);
        // generate appropiate y scale
        const yScale = d3.scaleLinear()
                        .domain([0, 1])
                        .range([chartHeight, 0]);
        // generate the chart body and append it to main DOM body
        let svg = d3.select('body')
                    .append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .attr('id', 'chart');
    
    // title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin)
            .attr('text-anchor', 'middle')
            .text('Grade Distribution');
    // x axis label
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin * 6)
            .attr('text-anchor', 'middle')
            .text('Grades');
    // y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Frequency (%)");  

    
    // create a group (g) for the bars
        let g = svg.append('g')
                    .attr('transform', `translate(${margin}, ${margin})`);
    // y-axis
        g.append('g')
        .call(d3.axisLeft(yScale));
    
    // x-axis
        g.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale));
    // spawn rectangles and give them their respective attributes
        let rectangles = g.selectAll('rect')
            .data(frequencey)
            .enter()
            .append('rect')
                .attr('x', (data) => xScale(data.grade))
                .attr('y', (data) => chartHeight)
                .attr('width', xScale.bandwidth())
                .attr('height', (data) => 0)
                .attr('fill', (data) => colourScale(data.freq))
    
        rectangles.transition()
            .ease(d3.easeElastic)
            .attr('height', (data) => chartHeight - yScale(data.freq))
            .attr('y', (data) => yScale(data.freq))
            .duration(1000)
            .delay((data, index) => index * 50);
        
        document.getElementById('table-container').appendChild(document.getElementById('chart'));
    }
});