import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {switchMap} from "rxjs";

export interface TelegramMessage {
  ok: boolean,
  result: {
    chat: {
      id: number,
      first_name: string,
      last_name: string,
      username: string,
      type: string
    },
    date: Date,
    from: {
      id: number,
      is_bot: boolean,
      first_name: string,
      username: string
    }
    message_id: number,
    text: string
  }




}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'homoantrBotFront';

  botSendForm: FormGroup;

  imagePreviewSrc = '';

  sentMedia: File = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
  }

  ngOnInit() {
    this.botSendForm = this.fb.group({
      method: ['sendPhoto'],
      chat_id: [481547986],
      text: [''],
      photo: [null],
      caption: [''],
      parse_mode: ['HTML'],
      reply_markup: ['{"inline_keyboard":[[{"text":"hey","url":"sportmon.org"}]]}']
    })
  }

  showOption(event: Event): void {
    console.log(event);
  }

  loadPosterLoaderPreview(event: any): void {
    const file = event.target.files[0]
    this.sentMedia = file

    const reader = new FileReader()

    reader.onload = () => {
      if (reader.result)
        this.imagePreviewSrc = reader.result.toString()
    }
    reader.readAsDataURL(file)
  }

  onSubmit(botSendForm: FormGroup): void {
    const fd = new FormData();
    const method = botSendForm.value['method'];
    const mediaName = this.getMediaNameForSelectedMethod(method);
    fd.set('chat_id', botSendForm.value['chat_id']);
    fd.set('text', botSendForm.value['text']);
    fd.set('caption', botSendForm.value['caption']);
    fd.set('parse_mode', botSendForm.value['parse_mode']);
    fd.set('reply_markup', botSendForm.value['reply_markup']);
    fd.set('pinned_message', 'pinned_message');
    if (this.sentMedia) {
      fd.append(mediaName, this.sentMedia, this.sentMedia.name);
    }
    this.http.post(`https://api.telegram.org/bot${environment.bot_token}/${method}`, fd)
      .pipe(
        switchMap(
          response => {
            let message: TelegramMessage = response as TelegramMessage;
            console.log(message.result.message_id);
            fd.set('chat_id', message.result.chat.id.toString());
            fd.set('message_id', message.result.message_id.toString());
            return this.http.post(`https://api.telegram.org/bot${environment.bot_token}/pinChatMessage`, fd)
          }
        )
      )
      .subscribe(
        response => {
          console.log(response);
        },
        error => console.error(error.error.message ? error.error.message : error)
      )
  }

  getMediaNameForSelectedMethod(method: string): string {
    switch (method) {
      case('sendMessage') :
        return 'text';
      case('sendPhoto') :
        return 'photo';
      case('sendAudio') :
        return 'audio';
      case('sendDocument') :
        return 'document';
      case('sendVideo') :
        return 'video';
      case('sendAnimation') :
        return 'animation';
      case('sendVoice') :
        return 'voice';
      case('sendVideoNote') :
        return 'video_note';
      default :
        return 'media'
    }
  }
}
