import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Clock, Phone, Zap, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BuyersBrokerage, PropertyBrokerage, MatchesBrokerage, Contact } from '@/api/entities';

export default function QuickActions() {
  const [isSendingAlerts, setIsSendingAlerts] = React.useState(false);
  const [isMatching, setIsMatching] = React.useState(false);

  const handleCheckUnansweredLeads = async () => {
    setIsSendingAlerts(true);
    try {
      const now = new Date();
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      
      const allLeads = await BuyersBrokerage.list();
      const contacts = await Contact.list();
      
      const untreatedLeads = allLeads.filter(lead => 
        lead.status === "קונה חדש" && new Date(lead.created_date) <= fourHoursAgo
      );

      if (untreatedLeads.length > 0) {
        const leadNames = untreatedLeads.map(lead => {
          const contact = contacts.find(c => c.id === lead.contact_id);
          return contact ? contact.full_name : 'ליד לא ידוע';
        }).join(', ');
        alert(`נמצאו ${untreatedLeads.length} לידים שלא טופלו למעלה מ-4 שעות: ${leadNames}. יש לעדכן את הסטטוס שלהם.`);
      } else {
        alert("לא נמצאו לידים חדשים הדורשים טיפול.");
      }

    } catch (error) {
      console.error("Error checking for unanswered leads:", error);
      alert("שגיאה בבדיקת לידים שלא טופלו.");
    }
    setIsSendingAlerts(false);
  };
  
  const handleGenerateMatches = async () => {
    setIsMatching(true);
    try {
      const [currentProperties, currentBuyers, existingMatches] = await Promise.all([
        PropertyBrokerage.list(),
        BuyersBrokerage.list(),
        MatchesBrokerage.list()
      ]);

      const existingMatchSet = new Set(existingMatches.map(m => `${m.property_id}_${m.buyer_id}`));
      const matchesToCreate = [];

      for (const buyer of currentBuyers) {
        for (const property of currentProperties) {
          const matchKey = `${property.id}_${buyer.id}`;

          if (existingMatchSet.has(matchKey)) {
            continue;
          }

          // Calculate match score dynamically
          let matchScore = 0;
          const maxScore = 100;
          
          // Area match (20 points)
          if (property.area === buyer.desired_area || buyer.desired_area === null) {
            matchScore += 20;
          }
          
          // Rooms match (20 points)
          if (property.rooms === buyer.desired_rooms || buyer.desired_rooms === null) {
            matchScore += 20;
          }
          
          // Property type match (25 points)
          if (property.property_type === buyer.desired_property_type || buyer.desired_property_type === null) {
            matchScore += 25;
          }
          
          // Transaction type match (15 points)
          if (property.listing_type === buyer.request_category || buyer.request_category === null) {
            matchScore += 15;
          }
          
          // Budget match (20 points) - within 10% tolerance
          if (property.price && buyer.budget) {
            const budgetRatio = property.price / buyer.budget;
            if (budgetRatio <= 1.0) {
              matchScore += 20; // Within budget
            } else if (budgetRatio <= 1.10) {
              matchScore += 15; // Within 10% over budget
            } else if (budgetRatio <= 1.20) {
              matchScore += 10; // Within 20% over budget
            }
          } else {
            matchScore += 10; // Partial credit if one is missing
          }
          
          // Only create match if score is at least 60%
          if (matchScore >= 60) {
            matchesToCreate.push({
              property_id: property.id,
              buyer_id: buyer.id,
              match_score: matchScore,
              status: 'הותאם'
            });
            existingMatchSet.add(matchKey);
          }
        }
      }

      if (matchesToCreate.length > 0) {
        await MatchesBrokerage.bulkCreate(matchesToCreate);
        alert(`נמצאו ונוצרו ${matchesToCreate.length} התאמות חדשות!`);
      } else {
        alert("לא נמצאו התאמות חדשות.");
      }

    } catch (error) {
       console.error("Error generating matches:", error);
       alert("שגיאה ביצירת התאמות.");
    }
    setIsMatching(false);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          פעולות מהירות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to={createPageUrl('PropertyBrokerage') + '?category=מגורים'}>
          <Button className="w-full justify-start" variant="outline">
            <Plus className="w-4 h-4 ml-2" />
            נכס חדש למגורים
          </Button>
        </Link>
        
        <Link to={createPageUrl('BuyersBrokerage') + '?category=מגורים'}>
          <Button className="w-full justify-start" variant="outline">
            <Plus className="w-4 h-4 ml-2" />
            קונה חדש למגורים
          </Button>
        </Link>

        <Link to={createPageUrl('MatchesBrokerage') + '?category=מגורים'}>
          <Button className="w-full justify-start" variant="outline">
            <Target className="w-4 h-4 ml-2" />
            התאמות מגורים
          </Button>
        </Link>
        
        <Link to={createPageUrl('ServiceCalls')}>
          <Button className="w-full justify-start" variant="outline">
            <Phone className="w-4 h-4 ml-2" />
            קריאת שירות חדשה
          </Button>
        </Link>

        <Button 
          className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
          onClick={handleGenerateMatches}
          disabled={isMatching}
        >
          <Zap className="w-4 h-4 ml-2" />
          {isMatching ? 'יוצר התאמות...' : 'צור התאמות חדשות'}
        </Button>
        
        <Button 
          className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"
          onClick={handleCheckUnansweredLeads}
          disabled={isSendingAlerts}
        >
          <AlertTriangle className="w-4 h-4 ml-2" />
          {isSendingAlerts ? 'בודק...' : 'בדוק לידים ללא מענה'}
        </Button>
      </CardContent>
    </Card>
  );
}