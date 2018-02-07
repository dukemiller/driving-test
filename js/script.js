function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

class Answer extends React.Component {

    constructor(props) {
        super();
        this.state = {
            style: {}
        }
    }

    click() {
        if (this.props.text === this.props.correct) {
            this.setState({ style: {'animation': 'correct 0.25s forwards'}})
            this.props.next();
        }

        else {
            this.setState({ style: {'animation': 'incorrect 0.25s forwards'}})
            this.props.missed()
        }
    }

    render() {

        return (
            <p style={this.state.style}>
                <a href="#" onClick={this.click.bind(this)}>{this.props.text}</a>
            </p>
        );
    }
}

class Question extends React.Component {

    shouldComponentUpdate(n) {
        return n.data == null || this.props.session !== n.session || this.props.data.title !== n.data.title;
    }

    render() {
        var session = this.props.session;
        var data = this.props.data;
        var image = data.image == null ? "" : <img src={data.image} />

        return (
            <div>
                <h2>{data.title}</h2>
                <hr />
                {image}
                {shuffle(data.answers).map((text, index) => 
                    <Answer text={text} 
                        key={session+text+index}
                        correct={data.correct}
                        next={() => { setTimeout(this.props.next, 600); }}
                        missed={this.props.missed}
                    /> )}
            </div>
        )
    }
}

class Quiz extends React.Component {
    
    constructor(props) {
        super()

        this.state = {
            source: props.source,
            state: 'ALL_QUESTIONS',
            questions: shuffle([...props.source]),
            missed: [],
            index: 0,
            session: guid()
        }
    }

    addToMissed(question) {
        if (!this.state.missed.includes(question))
            this.setState(prev => ({ missed: [...prev.missed, question] }));
    }

    next() {
        var index = this.state.index + 1;

        if (index < this.state.questions.length)
            this.setState({ index: index });
        
        else {

            // Transition to missed questions

            if (this.state.state === "ALL_QUESTIONS") {

                this.setState(prev => ({ 
                    index: 0,
                    state: "MISSED_QUESTIONS",
                    questions: shuffle([...prev.missed]),
                    missed: [],
                    session: guid()
                }))

            }

            else {

                // If still missing, reset question pool
                if (this.state.missed.length > 0) {
                    this.setState(prev => ({
                        index: 0,
                        questions: shuffle([...prev.missed]),
                        missed: [],
                        session: guid()
                    }));
                }

                // Otherwise go back to all questions
                else {
                    this.setState({
                        index: 0,
                        state: "ALL_QUESTIONS",
                        questions: shuffle([...this.state.source]),
                        missed: [],
                        session: guid()
                    });
                }
            }
        }

    }

    render() {
        const question = this.state.questions[this.state.index];

        return (
            <div>

                <Details 
                    state={this.state.state} 
                    index={this.state.index} 
                    length={this.state.questions.length}
                    missed={this.state.missed.length} />

                <Question data={question} 
                    session={this.state.session}
                    next={this.next.bind(this)} 
                    missed={() => this.addToMissed(question)} />

            </div>
        )
    }
}

class Details extends React.Component {
    render() {
        let { state, index, length, missed } = this.props;
        let missing = missed > 0 ? <span style={{opacity: '0.4'}}>({missed} missed)</span> : ""
        return (
            <p>{state} - {index + 1}/{length} {missing}</p>
        )
    }
}

class App extends React.Component {

    constructor() {
        super();
        this.state = {
            sources: {},
            selected: ""
        }
    }

    componentDidMount() {
        fetch('questions.json')
            .then(response => response.json())
            .then(json => this.setState({sources: json, selected: 'azdot'}));
    }

    render() {
        if (this.state.selected === "")
            return <p>...</p>
        return (
            <Quiz source={this.state.sources[this.state.selected]} />
        );
    }

}

ReactDOM.render(
    <App />, document.getElementById( "react-app" )
);