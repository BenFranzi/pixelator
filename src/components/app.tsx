import { FunctionalComponent, h } from 'preact';
import { Route, Router } from 'preact-router';
import Editor from '../routes/editor';

const App: FunctionalComponent = () => {
    return (
        <div id="preact_root">
            <Router>
                <Route path="/" component={Editor} />
            </Router>
        </div>
    );
};

export default App;
