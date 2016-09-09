//parent component, renders board and controls and connects the two
var GameOfLife = React.createClass({
    //default board and control state
    getInitialState: function(){
        return {
            height: 20,
            width: 20,
            interval: 500,
            pause: false,
            boardKey: 0,
            percentLife: 0.3,
            generations: 0,
            nextHeight: 20,
            nextWidth: 20
        };
    },
    //handles changes from input
    handleChange: function(event){
        var newState = {};
        
        if (event.target.name === "interval") {
            //interval is set in second and needs to be converted to milliseconds
            newState[event.target.name] = event.target.value * 1000;
        }
        else if (event.target.name === "pause") {
            newState.pause = event.target.checked;
        }
        else if (event.target.name === "randomize") {
            this.setState({empty: false}, this.resetBoard);
        }
        else if (event.target.name === "clear"){
            this.setState({empty: true}, this.resetBoard);
        }
        else if (event.target.name === "width"){
            this.setState({nextWidth: +event.target.value});
        }
        else if (event.target.name === "height"){
            this.setState({nextHeight: +event.target.value});
        }
        else if (event.target.name === "percentLife"){
            newState.percentLife = event.target.value;
        }
        else if (event.target.name === "resetGenerations"){
            newState.generations = 0;
        }
        else if (event.target.name === "applySize"){
            console.log("this.state: ", this.state);
            this.setState({
                height: this.state.nextHeight,
                width: this.state.nextWidth
            }, this.resetBoard);
        }
        this.setState(newState);
    },
    //increases the generation count by one
    incrementGenereations: function(){
        this.setState({generations: this.state.generations + 1});
    },
    resetBoard: function(){
        this.setState({boardKey: this.state.boardKey + 1, generations: 0});
    },
    render: function(){
        var style = {
            height: "100%",
            width: "100%"
        };
        return <div style={style}>
            <div
                style={{height: "70%", width: "100%"}}>
                <FixedRatio
                    childComponents={(
                        <Board
                            height={this.state.height}
                            width={this.state.width}
                            interval={this.state.interval}
                            pause={this.state.pause}
                            percentLife={this.state.percentLife}
                            empty={this.state.empty}
                            key={this.state.boardKey}
                            incrementGenereations={this.incrementGenereations}
                        />
                    )}
                    ratio={this.state.width/this.state.height}
                />
            </div>
            <Controls
                handleChange={this.handleChange}
                height={this.state.nextHeight}
                width={this.state.nextWidth}
                interval={this.state.interval}
                pause={this.state.pause}
                percentLife={this.state.percentLife}
                generations={this.state.generations}
                />
            </div>;
    }
});
//contains cells and game logic, accepts game parameters as props
//props include: height={int}, width={int}, play={bool}, interval={float}, borderSize={int}
var Board = React.createClass({
    getInitialState: function() {
        //set inital board update rate if game is not paused
        var interval = undefined;
        if (this.props.pause === false) {
            interval = window.setInterval(this.update, this.props.interval);
        }

        //build initial cell values
        var initialCellValues = [];
        var size = this.props.height * this.props.width;
        for (var i=0; i < size; i++){
            if (!this.props.empty){
                initialCellValues.push(Math.random() < this.props.percentLife);
            }
            else {
                initialCellValues.push(false);
            }
        }

        return {
            status: initialCellValues,
            interval: interval,
            cellNeighbors: this.buildCellNeighbors(),
            cellHeight: 100/this.props.height + "%",
            cellWidth: 100/this.props.width + "%",
            cellCount: this.props.height * this.props.width,
            cellStyle: {
                height: "100%",
                width: "100%",
                fontSize: "0px",
                cursor: "pointer",
                overflow: "hidden" }};
    },
    //runs when prop(s) are updated
    componentWillReceiveProps: function(nextProps){
        window.clearInterval(this.state.interval);
        var newState = {};
        //if the new state isn't paused then once again set the interval
        if (nextProps.pause === false){
            newState.interval = window.setInterval(this.update, nextProps.interval);;
        }
        this.setState(newState);
    },
    //returns an array with filled with an array for each cell with the index of that cells neighbors
    buildCellNeighbors: function(){
        var cellNeighbors = [];
        //this.state.status.forEach(function(alive, i, status){
        for (var i = 0; i < this.props.height * this.props.width; i++) {
            var currentNeighbors = [];
            //determine if cell is on the top, left, right, or bottom of grid
            var top = this.props.width - i > 0;
            var left = i % this.props.width === 0;
            var right = i % this.props.width === this.props.width - 1;
            var bottom = (this.props.height - 1) * this.props.width < i + 1;
            /*console.log("cell " + i
                + "\n   top: " + top
                + "\n   left: " + left
                + "\n   right: " + right
                + "\n   bottom: " + bottom);*/
            //for each potential neighbor, if that neighbor isn't off the grid then add it's index to the array
            if (!top && !left){
                currentNeighbors.push(i - this.props.width - 1);
            }
            if (!top){
                currentNeighbors.push(i - this.props.width);
            }
            if (!top && !right){
                currentNeighbors.push(i - this.props.width + 1);
            }
            if (!right){
                currentNeighbors.push(i + 1);
            }
            if (!right && !bottom){
                currentNeighbors.push(i + this.props.width + 1);
            }
            if (!bottom){
                currentNeighbors.push(i + this.props.width);
            }
            if (!bottom && !left){
                currentNeighbors.push(i + this.props.width - 1);
            }
            if (!left){
                currentNeighbors.push(i - 1);
            }
            //console.log("neighbors: " + currentNeighbors);
            cellNeighbors.push(currentNeighbors);
        }
        return cellNeighbors;
    },
    //increments the game of life
    update: function(){
        //new game of life board status
        var newStatus = [];
        //loops though previous game board and pushes the status of cells to the new board one at a time
        //this.state.status.forEach(function(alive, i, status){
        for (var i in this.state.cellNeighbors){
            var neighbors = 0;
            //console.log("cell: " + i);
            for (var p in this.state.cellNeighbors[i]) {
                if (this.state.status[this.state.cellNeighbors[i][p]]) {
                    //console.log("   live neighbor at: " + this.state.cellNeighbors[i][p]);
                    neighbors++;
                }
            }
            //console.log("   " + neighbors + " live neighbors");
            /*
            RULES:
            +  Any live cell with fewer than two live neighbours dies, as if caused by under-population.
            +  Any live cell with two or three live neighbours lives on to the next generation.
            +  Any live cell with more than three live neighbours dies, as if by over-population.
            +  Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            following code executes rules
            */
            if (neighbors < 2){
                newStatus.push(false);
            }
            else if (neighbors === 2){
                if (this.state.status[i]){
                    newStatus.push(true);
                }
                else {
                    newStatus.push(false);
                }
            }
            else if (neighbors === 3){
                newStatus.push(true);
            }
            else {
                newStatus.push(false);
            }
            //console.log("   new status: ", newStatus[newStatus.length - 1]);
        };
        //console.log("new status: ", newStatus);
        this.props.incrementGenereations();
        this.setState({status: newStatus});
    },
    editCell: function(cell){
        this.state.status[cell] = !this.state.status[cell];
        this.setState({status: this.state.status});
    },
    componentWillUnmount: function(){
        window.clearInterval(this.state.interval);
    },
    render: function(){
        var cells = [];
        for (var i = 0; i < this.state.cellCount; i++) {
            cells.push(
                <Cell
                    status={this.state.status[i] ? "alive" : "dead"}
                    height={this.state.cellHeight}
                    width={this.state.cellWidth}
                    key={i}
                    index={i}
                    handleClick={this.editCell}
                />
            )
        }
        return <div style={this.state.cellStyle}>{cells}</div>;
    }
});
//Creates a div of a given ratio (width/hight) as large as it can in the given context and then renders whatever is passed as the prop "childComponents" and it's children". Has a 200ms resize timeout for performance.
//props: include: ratio={width/height}, childComponents={compoenents to be rendered as children}
var FixedRatio = React.createClass({
    getInitialState: function(){
        return {style: {visibility: "hidden"}, domNode: undefined}
    },
    componentDidMount: function(){
        this.remeasure();
        window.addEventListener("resize", this.remeasure);
    },
    componentWillUnmount: function(){
        window.removeEventListener("resize", this.remeasure);
    },
    remeasure: function(){
        //timeout code so that we don't remeasure for every step while the window is being resized
        window.clearTimeout(this.state.remeasureTimeout);
        var remeasureTimeout = window.setTimeout(run.bind(this), 200);
        this.setState({remeasureTimeout: remeasureTimeout})
        function run(){
            //if the context ratio is wider than the target ratio
            if (this.state.domNode.offsetWidth / this.state.domNode.offsetHeight > this.props.ratio) {
                this.setState({style: {
                    height: this.state.domNode.offsetHeight + "px",
                    width: (this.state.domNode.offsetHeight * this.props.ratio) + "px",
                    margin: "auto"
                }});
            }
            else {
                this.setState({style: {
                    height: (this.state.domNode.offsetWidth / this.props.ratio) + "px",
                    width: this.state.domNode.offsetWidth,
                    paddingTop: (this.state.domNode.offsetHeight - this.state.domNode.offsetWidth / this.props.ratio) / 2
                }});
            }
        }
    },
    //if the ratio prop changes then remeasure, this is not in the "render" fuction because we do not want to remeaure when the childComponents prop changes
    componentWillReceiveProps: function(newProps){
        if (newProps.ratio !== this.props.ratio){
            this.remeasure();
        }
    },
    updateDOMRef: function(node){
        this.setState({domNode: node});
    },
    render: function(){
        //returns a div that we will use to measure the space we have and a <div> that we will size depending on the ratio given
        return <div
                    style={{height: "100%", width: "100%"}}
                    ref={this.updateDOMRef}
                >
            <div style={this.state.style}>
                {this.props.childComponents}
            </div>
        </div>
    }
});
var Cell = React.createClass({
    //lets Board know that cell has been clicked and gives it the cell index so it knows were the click was
    handleClick: function(){
        this.props.handleClick(this.props.index);
    },
    render: function(){
        var style = {
            backgroundColor: this.props.status === "alive" ? "white" : "black",
            height: this.props.height,
            width: this.props.width,
            display: "inline-block",
        };
        return <div style={style} onClick={this.handleClick}/>
    }
});
var Controls = React.createClass({
    render: function(){
        var vPad = "3px"
        var hPad = "5px"
        var inputWrapStyle = {
            display: "inline-block",
            backgroundColor: "rgb(240, 240, 240)",
            padding: vPad + " 0px 0px " + hPad,
            margin: "4px 6px",
            textAlign: "center"
        };
        var elementStyle = {
            verticalAlign: "middle",
            margin: "0px " + hPad + " " + vPad + " 0px",
            display: "inline-block"
        };
        var buttonStyle = Object.assign({
            fontSize: "14px"
        }, elementStyle);
        var textInputStyle = Object.assign({
            border: "none",
            fontSize: "inherit",
            padding: vPad + " " + hPad,
            textAlign: "center"
        }, elementStyle);
        var sliderStyle = Object.assign({
            margin: "0px " + hPad + " " + vPad + " 0px"
        }, elementStyle);
        return <div style={{
                            position: "relative",
                            height: "30%",
                            maxWidth: "600px",
                            margin: "auto",
                            fontSize: "16px",
                            overflow: "auto",
                            textAlign: "center"
                        }}>
            <div style={inputWrapStyle}>
                <label
                    style={elementStyle}>Refresh Delay</label>
                <input
                    onChange={this.props.handleChange}
                    style={sliderStyle}
                    type="range"
                    value={this.props.interval / 1000}
                    name="interval"
                    min="0.05"
                    max="1"
                    step="0.05"/>
                <span style={elementStyle} >
                    {(this.props.interval / 1000).toFixed(2)} seconds
                    </span>
            </div>
            <div style={inputWrapStyle} >
                <span style={elementStyle} >Generations:</span>
                <span style={Object.assign({}, elementStyle, {width: "3em", textAlign: "right", display: "inline-block"})}>{this.props.generations}</span>
                <input
                    style={buttonStyle}
                    type="button"
                    onClick={this.props.handleChange}
                    name="resetGenerations"
                    value="reset" />
            </div>
            <div style={inputWrapStyle}>
                <label style={elementStyle}
                    >Pause</label>
                <input
                    type="checkbox"
                    style={elementStyle}
                    onChange={this.props.handleChange}
                    checked={this.props.pause}
                    name="pause"
                    />
            </div>
            <div style={inputWrapStyle}>
                <input
                    style={buttonStyle}
                    type="button"
                    onClick={this.props.handleChange}
                    name="clear"
                    value="clear"
                    />
            </div>
            <div style={inputWrapStyle}>
                <input
                    style={buttonStyle}
                    type="button"
                    onClick={this.props.handleChange}
                    name="randomize"
                    value="randomize"
                    />
                <input
                    onChange={this.props.handleChange}
                    style={sliderStyle}
                    type="range"
                    defaultValue={this.props.percentLife}
                    name="percentLife"
                    min="0"
                    max="1"
                    step="0.01"/>
                <span style={Object.assign({}, elementStyle, {textAlign: "right", width: "38px"})}>{(this.props.percentLife * 100).toFixed(0)}%</span>
            </div>
            <div style={inputWrapStyle}>
                <span
                    style={elementStyle}>
                    Size:</span>
                <input
                    style={Object.assign({}, textInputStyle, {width: "2.5em"})}
                    type="number"
                    onChange={this.props.handleChange}
                    name="width"
                    defaultValue={this.props.width}
                    />
                <span
                    style={elementStyle}>
                    x</span>
                <input
                    style={Object.assign({}, textInputStyle, {width: "2.5em"})}
                    type="number"
                    onChange={this.props.handleChange}
                    name="height"
                    defaultValue={this.props.height}
                    />
                <input
                    style={buttonStyle}
                    type="button"
                    onClick={this.props.handleChange}
                    name="applySize"
                    value="Apply"
                    />
            </div>
        </div>
    }
});
window.onload = function(){
    ReactDOM.render(
    <GameOfLife />,
    document.getElementById("container")
    );
};