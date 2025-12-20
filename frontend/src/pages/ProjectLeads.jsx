import React, { useState, useEffect } from "react";
import { ProjectLead, Contact, Project } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Target } from "lucide-react";
import { motion } from "framer-motion";

import ProjectLeadsList from "../components/projectLeads/ProjectLeadsList";
import ProjectLeadsForm from "../components/projectLeads/ProjectLeadsForm";
import ProjectLeadsFilters from "../components/projectLeads/ProjectLeadsFilters";

export default function ProjectLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    source: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leadsData, contactsData, projectsData] = await Promise.all([
        ProjectLead.list("-created_date"),
        Contact.list(),
        Project.list()
      ]);
      setLeads(leadsData);
      setContacts(contactsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead => {
        const contact = contacts.find(c => c.id === lead.contact_id);
        const project = projects.find(p => p.id === lead.interested_project_id);
        return contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               project?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    if (filters.source !== "all") {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    setFilteredLeads(filtered);
  };

  const handleSubmit = async (leadData) => {
    try {
      if (editingLead) {
        await ProjectLead.update(editingLead.id, leadData);
      } else {
        await ProjectLead.create(leadData);
      }
      setShowForm(false);
      setEditingLead(null);
      loadData();
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleDelete = async (leadId) => {
    try {
      await ProjectLead.delete(leadId);
      loadData();
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              לידים לפרויקט
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל הלידים לפרויקטים</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            ליד חדש
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProjectLeadsFilters 
              filters={filters}
              onFiltersChange={setFilters}
              leads={leads}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="חפש לידים לפי שם או פרויקט..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </motion.div>

            {showForm && (
              <ProjectLeadsForm
                lead={editingLead}
                contacts={contacts}
                projects={projects}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingLead(null);
                }}
              />
            )}

            <ProjectLeadsList
              leads={filteredLeads}
              contacts={contacts}
              projects={projects}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}