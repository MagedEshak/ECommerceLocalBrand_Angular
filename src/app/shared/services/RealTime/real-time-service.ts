import { Injectable, signal } from '@angular/core';
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

    this.hubConnection.start().then().catch();
  }

  public onNewProductsArrived(callback: (products: any[]) => void): void {
    this.hubConnection.on('NewProductsArrived', (products) => {
      callback(products);
    });
  }
}
