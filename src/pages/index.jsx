import Layout from "./Layout.jsx";

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
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Properties" element={<Properties />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/ServiceCalls" element={<ServiceCalls />} />
                
                <Route path="/Suppliers" element={<Suppliers />} />
                
                <Route path="/Meetings" element={<Meetings />} />
                
                <Route path="/Tasks" element={<Tasks />} />
                
                <Route path="/Contacts" element={<Contacts />} />
                
                <Route path="/PropertyBrokerage" element={<PropertyBrokerage />} />
                
                <Route path="/BuyersRenters" element={<BuyersRenters />} />
                
                <Route path="/Matches" element={<Matches />} />
                
                <Route path="/BuyerLeadForm" element={<BuyerLeadForm />} />
                
                <Route path="/MatchesBrokerage" element={<MatchesBrokerage />} />
                
                <Route path="/BuyersBrokerage" element={<BuyersBrokerage />} />
                
                <Route path="/PropertyInventory" element={<PropertyInventory />} />
                
                <Route path="/PropertyOwners" element={<PropertyOwners />} />
                
                <Route path="/Tenants" element={<Tenants />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/ProjectLeads" element={<ProjectLeads />} />
                
                <Route path="/MarketingLeads" element={<MarketingLeads />} />
                
                <Route path="/BrokerageDashboard" element={<BrokerageDashboard />} />
                
                <Route path="/PropertyManagementDashboard" element={<PropertyManagementDashboard />} />
                
                <Route path="/ProjectsDashboard" element={<ProjectsDashboard />} />
                
                <Route path="/PropertyOwnerManagement" element={<PropertyOwnerManagement />} />
                
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