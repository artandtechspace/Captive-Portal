import {Route, Routes} from 'react-router-dom';

import {AppLayout} from './components/layout/AppLayout';
import {LoginPage} from './pages/LoginPage';
import {TermsPage} from './pages/TermsPage';

const App = () => {
    return (
        <Routes>
            <Route element={<AppLayout/>}>
                <Route path="index.html" element={<LoginPage/>}/>
                <Route index element={<LoginPage/>}/>
                <Route path="/terms" element={<TermsPage/>}/>
            </Route>
        </Routes>
    );
};

export default App;
