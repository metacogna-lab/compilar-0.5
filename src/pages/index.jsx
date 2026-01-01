import Layout from "./Layout.jsx";

import About from "./About";

import Achievements from "./Achievements";

import Admin from "./Admin";

import AdminAnalytics from "./AdminAnalytics";

import AdminDashboard from "./AdminDashboard";

import AdminDocs from "./AdminDocs";

import Assess from "./Assess";

import BlogPost from "./BlogPost";

import CMS from "./CMS";

import CompilarAdminLogin from "./CompilarAdminLogin";

import Components from "./Components";

import ContactUs from "./ContactUs";

import DevelopmentPlans from "./DevelopmentPlans";

import DynamicPage from "./DynamicPage";

import FAQ from "./FAQ";

import GamificationHub from "./GamificationHub";

import GlobalMap from "./GlobalMap";

import GroupLeaderDashboard from "./GroupLeaderDashboard";

import Groups from "./Groups";

import Home from "./Home";

import KnowledgeGraph from "./KnowledgeGraph";

import Landing from "./Landing";

import Leaderboard from "./Leaderboard";

import LearningPathways from "./LearningPathways";

import PilarDefinitions from "./PilarDefinitions";

import PilarInfo from "./PilarInfo";

import Pillar from "./Pillar";

import PolicyApplications from "./PolicyApplications";

import PolicyBlog from "./PolicyBlog";

import Profile from "./Profile";

import ProgressDashboard from "./ProgressDashboard";

import StudyGroupWorkspace from "./StudyGroupWorkspace";

import StudyGroups from "./StudyGroups";

import TeamWorkspace from "./TeamWorkspace";

import Teams from "./Teams";

import TheoryMadeSimple from "./TheoryMadeSimple";

import UserPilarProfile from "./UserPilarProfile";

import WhatIsCompilar from "./WhatIsCompilar";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    About: About,
    
    Achievements: Achievements,
    
    Admin: Admin,
    
    AdminAnalytics: AdminAnalytics,
    
    AdminDashboard: AdminDashboard,
    
    AdminDocs: AdminDocs,
    
    Assess: Assess,
    
    BlogPost: BlogPost,
    
    CMS: CMS,
    
    CompilarAdminLogin: CompilarAdminLogin,
    
    Components: Components,
    
    ContactUs: ContactUs,
    
    DevelopmentPlans: DevelopmentPlans,
    
    DynamicPage: DynamicPage,
    
    FAQ: FAQ,
    
    GamificationHub: GamificationHub,
    
    GlobalMap: GlobalMap,
    
    GroupLeaderDashboard: GroupLeaderDashboard,
    
    Groups: Groups,
    
    Home: Home,
    
    KnowledgeGraph: KnowledgeGraph,
    
    Landing: Landing,
    
    Leaderboard: Leaderboard,
    
    LearningPathways: LearningPathways,
    
    PilarDefinitions: PilarDefinitions,
    
    PilarInfo: PilarInfo,
    
    Pillar: Pillar,
    
    PolicyApplications: PolicyApplications,
    
    PolicyBlog: PolicyBlog,
    
    Profile: Profile,
    
    ProgressDashboard: ProgressDashboard,
    
    StudyGroupWorkspace: StudyGroupWorkspace,
    
    StudyGroups: StudyGroups,
    
    TeamWorkspace: TeamWorkspace,
    
    Teams: Teams,
    
    TheoryMadeSimple: TheoryMadeSimple,
    
    UserPilarProfile: UserPilarProfile,
    
    WhatIsCompilar: WhatIsCompilar,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<About />} />
                
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Achievements" element={<Achievements />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/AdminAnalytics" element={<AdminAnalytics />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminDocs" element={<AdminDocs />} />
                
                <Route path="/Assess" element={<Assess />} />
                
                <Route path="/BlogPost" element={<BlogPost />} />
                
                <Route path="/CMS" element={<CMS />} />
                
                <Route path="/CompilarAdminLogin" element={<CompilarAdminLogin />} />
                
                <Route path="/Components" element={<Components />} />
                
                <Route path="/ContactUs" element={<ContactUs />} />
                
                <Route path="/DevelopmentPlans" element={<DevelopmentPlans />} />
                
                <Route path="/DynamicPage" element={<DynamicPage />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/GamificationHub" element={<GamificationHub />} />
                
                <Route path="/GlobalMap" element={<GlobalMap />} />
                
                <Route path="/GroupLeaderDashboard" element={<GroupLeaderDashboard />} />
                
                <Route path="/Groups" element={<Groups />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/KnowledgeGraph" element={<KnowledgeGraph />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/LearningPathways" element={<LearningPathways />} />
                
                <Route path="/PilarDefinitions" element={<PilarDefinitions />} />
                
                <Route path="/PilarInfo" element={<PilarInfo />} />
                
                <Route path="/Pillar" element={<Pillar />} />
                
                <Route path="/PolicyApplications" element={<PolicyApplications />} />
                
                <Route path="/PolicyBlog" element={<PolicyBlog />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/ProgressDashboard" element={<ProgressDashboard />} />
                
                <Route path="/StudyGroupWorkspace" element={<StudyGroupWorkspace />} />
                
                <Route path="/StudyGroups" element={<StudyGroups />} />
                
                <Route path="/TeamWorkspace" element={<TeamWorkspace />} />
                
                <Route path="/Teams" element={<Teams />} />
                
                <Route path="/TheoryMadeSimple" element={<TheoryMadeSimple />} />
                
                <Route path="/UserPilarProfile" element={<UserPilarProfile />} />
                
                <Route path="/WhatIsCompilar" element={<WhatIsCompilar />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}