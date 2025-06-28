import React from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText
} from '@ionic/react';
import {
  mailOutline,
  alertCircleOutline,
  timeOutline,
  flashOutline
} from 'ionicons/icons';
import { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
  stats: Stats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Emails',
      value: stats.totalEmails,
      icon: mailOutline,
      color: 'primary'
    },
    {
      title: 'Action Required',
      value: stats.actionRequired,
      icon: alertCircleOutline,
      color: 'warning'
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: flashOutline,
      color: 'danger'
    },
    {
      title: "Today's Deadlines",
      value: stats.todaysDeadlines,
      icon: timeOutline,
      color: 'secondary'
    }
  ];

  return (
    <IonGrid>
      <IonRow>
        {statCards.map((stat, index) => (
          <IonCol size="6" key={index}>
            <IonCard>
              <IonCardContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <IonText color="medium">
                      <p style={{ margin: 0, fontSize: '0.9em' }}>{stat.title}</p>
                    </IonText>
                    <IonText color={stat.color}>
                      <h2 style={{ margin: '4px 0', fontSize: '2em', fontWeight: 'bold' }}>
                        {stat.value}
                      </h2>
                    </IonText>
                  </div>
                  <IonIcon 
                    icon={stat.icon} 
                    color={stat.color}
                    style={{ fontSize: '2.5em', opacity: 0.3 }}
                  />
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        ))}
      </IonRow>
    </IonGrid>
  );
};