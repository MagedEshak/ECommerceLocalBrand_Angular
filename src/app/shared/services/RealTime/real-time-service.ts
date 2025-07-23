import { Injectable, signal } from '@angular/core';
import { from } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class RealTimeService {
  private hubConnection!: signalR.HubConnection;

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseServerUrl}/ProductHub`) // غيّر الرابط حسب API عندك
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ SignalR connection started.'))
      .catch((err) => console.error('❌ SignalR connection error:', err));
  }

  public onNewProductsArrived(callback: (products: any[]) => void): void {
    this.hubConnection.on('NewProductsArrived', (products) => {
      console.log('📦 Received products:', products);
      callback(products);
    });
  }
}
