import Layout from "./Layout.jsx";
import Login from "./Login";
import ProtectedRoute from "@/components/ProtectedRoute";

import Dashboard from "./Dashboard";

import Properties from "./Properties";

import Clients from "./Clients";

import ServiceCalls from "./ServiceCalls";

import Suppliers from "./Suppliers";

import Meetings from "./Meetings";

import Tasks from "./Tasks";

import Contacts from "./Contacts";

import PropertyBrokerage from "./PropertyBrokerage";

import BuyersRenters from "./BuyersRenters";

import Matches from "./Matches";

import BuyerLeadForm from "./BuyerLeadForm";

import MatchesBrokerage from "./MatchesBrokerage";

import BuyersBrokerage from "./BuyersBrokerage";

import PropertyInventory from "./PropertyInventory";

import PropertyOwners from "./PropertyOwners";

import Tenants from "./Tenants";

import Projects from "./Projects";

import ProjectLeads from "./ProjectLeads";

import MarketingLeads from "./MarketingLeads";

import BrokerageDashboard from "./BrokerageDashboard";

import PropertyManagementDashboard from "./PropertyManagementDashboard";

import ProjectsDashboard from "./ProjectsDashboard";

import PropertyOwnerManagement from "./PropertyOwnerManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Properties: Properties,
    
    Clients: Clients,
    
    ServiceCalls: ServiceCalls,
    
    Suppliers: Suppliers,
    
    Meetings: Meetings,
    
    Tasks: Tasks,
    
    Contacts: Contacts,
    
    PropertyBrokerage: PropertyBrokerage,
    
    BuyersRenters: BuyersRenters,
    
    Matches: Matches,
    
    BuyerLeadForm: BuyerLeadForm,
    
    MatchesBrokerage: MatchesBrokerage,
    
    BuyersBrokerage: BuyersBrokerage,
    
    PropertyInventory: PropertyInventory,
    
    PropertyOwners: PropertyOwners,
    
    Tenants: Tenants,
    
    Projects: Projects,
    
    ProjectLeads: ProjectLeads,
    
    MarketingLeads: MarketingLeads,
    
    BrokerageDashboard: BrokerageDashboard,
    
    PropertyManagementDashboard: PropertyManagementDashboard,
    
    ProjectsDashboard: ProjectsDashboard,
    
    PropertyOwnerManagement: PropertyOwnerManagement,
    
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
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                <Route path="/Properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
                
                <Route path="/Clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                
                <Route path="/ServiceCalls" element={<ProtectedRoute><ServiceCalls /></ProtectedRoute>} />
                
                <Route path="/Suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
                
                <Route path="/Meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
                
                <Route path="/Tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                
                <Route path="/Contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                
                <Route path="/PropertyBrokerage" element={<ProtectedRoute><PropertyBrokerage /></ProtectedRoute>} />
                
                <Route path="/BuyersRenters" element={<ProtectedRoute><BuyersRenters /></ProtectedRoute>} />
                
                <Route path="/Matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
                
                <Route path="/BuyerLeadForm" element={<ProtectedRoute><BuyerLeadForm /></ProtectedRoute>} />
                
                <Route path="/MatchesBrokerage" element={<ProtectedRoute><MatchesBrokerage /></ProtectedRoute>} />
                
                <Route path="/BuyersBrokerage" element={<ProtectedRoute><BuyersBrokerage /></ProtectedRoute>} />
                
                <Route path="/PropertyInventory" element={<ProtectedRoute><PropertyInventory /></ProtectedRoute>} />
                
                <Route path="/PropertyOwners" element={<ProtectedRoute><PropertyOwners /></ProtectedRoute>} />
                
                <Route path="/Tenants" element={<ProtectedRoute><Tenants /></ProtectedRoute>} />
                
                <Route path="/Projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                
                <Route path="/ProjectLeads" element={<ProtectedRoute><ProjectLeads /></ProtectedRoute>} />
                
                <Route path="/MarketingLeads" element={<ProtectedRoute><MarketingLeads /></ProtectedRoute>} />
                
                <Route path="/BrokerageDashboard" element={<ProtectedRoute><BrokerageDashboard /></ProtectedRoute>} />
                
                <Route path="/PropertyManagementDashboard" element={<ProtectedRoute><PropertyManagementDashboard /></ProtectedRoute>} />
                
                <Route path="/ProjectsDashboard" element={<ProtectedRoute><ProjectsDashboard /></ProtectedRoute>} />
                
                <Route path="/PropertyOwnerManagement" element={<ProtectedRoute><PropertyOwnerManagement /></ProtectedRoute>} />
                
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