import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonIcon,
  IonBadge
} from '@ionic/react';
import { timeOutline, alertCircleOutline, mailOutline } from 'ionicons/icons';
import { Email, AnalysisResult, UrgencyLevel } from '../types';
import { format } from 'date-fns';

interface EmailCardProps {
  email: Email;
  analysis?: AnalysisResult;
  onClick?: () => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email, analysis, onClick }) => {
  const getUrgencyColor = (level?: UrgencyLevel): string => {
    switch (level) {
      case UrgencyLevel.HIGH:
        return 'danger';
      case UrgencyLevel.MEDIUM:
        return 'warning';
      case UrgencyLevel.LOW:
        return 'success';
      default:
        return 'medium';
    }
  };

  const getActionChip = () => {
    if (!analysis?.needsAction) return null;
    
    return (
      <IonChip color={getUrgencyColor(analysis.urgencyLevel)}>
        <IonIcon icon={alertCircleOutline} />
        <IonLabel>{analysis.actionType}</IonLabel>
      </IonChip>
    );
  };

  return (
    <IonCard onClick={onClick} button={!!onClick}>
      <IonCardHeader>
        <IonCardSubtitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{email.from}</span>
            {!email.isRead && <IonBadge color="primary">New</IonBadge>}
          </div>
        </IonCardSubtitle>
        <IonCardTitle>{email.subject}</IonCardTitle>
      </IonCardHeader>
      
      <IonCardContent>
        <p className="email-preview">
          {email.body.substring(0, 150)}...
        </p>
        
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {getActionChip()}
          
          {analysis?.deadline && (
            <IonChip color="secondary">
              <IonIcon icon={timeOutline} />
              <IonLabel>Due {format(analysis.deadline, 'MMM dd')}</IonLabel>
            </IonChip>
          )}
          
          <IonChip color="light">
            <IonIcon icon={mailOutline} />
            <IonLabel>{format(email.date, 'MMM dd, h:mm a')}</IonLabel>
          </IonChip>
        </div>
        
        {analysis?.summary && (
          <p style={{ marginTop: '12px', fontSize: '0.9em', color: 'var(--ion-color-medium)' }}>
            {analysis.summary}
          </p>
        )}
      </IonCardContent>
    </IonCard>
  );
};