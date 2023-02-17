import { App } from 'jovo-framework';
import { Alexa } from 'jovo-platform-alexa';
import { JovoDebugger } from 'jovo-plugin-debugger';
import { FileDb } from 'jovo-db-filedb';
import { GoogleAssistant } from 'jovo-platform-googleassistant';
import axios from 'axios';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------
const ENDPOINT = 'http://localhost/v1/';
const app = new App();

app.use(new Alexa(), new GoogleAssistant(), new JovoDebugger(), new FileDb());

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
  LAUNCH() {
    return this.toIntent('HelloWorldIntent');
  },

  HelloWorldIntent() {
    this.ask('Hello there!');
  },

  async SetToolIntent() {
    const toolName = (this.$inputs.name.value as string).toUpperCase();
    const validTools = [ 'PEN', 'RECTANGLE', 'OVAL' ];
    const validOptions = [ 'pen', 'rect', 'oval' ];
    if (validTools.includes(toolName)) {
      // toolName is valid
      const option = validOptions[validTools.indexOf(toolName)];
      try {
        const response = await axios.get(ENDPOINT + `mode?type=${option}`);
        console.log(`info: SetToolIntent:${response.data}`);
        this.ask(`setting tool to ${toolName.toLowerCase()}`);
      } catch (error) {
        console.log('error: SetToolIntent:try_catch');
        console.log(error);
        this.ask('Something went wrong, please try again later');
      }
    } else {
      // toolName is invalid
      this.$speech.addText('Invalid tool name, please choose from ');
      validTools.forEach((element, index) => {
        if (index !== validTools.length - 1) {
          this.$speech.addBreak('250ms');
        } else {
          this.$speech.addText(' and ');
        }
        this.$speech.addText(element.toLowerCase());
      });
      this.ask(this.$speech);
      console.log(`error: SetToolIntent:invalid_tool_name ${toolName}`);
    }
  },

  async RemoveToolIntent() {
    try {
      const response = await axios.get(ENDPOINT + 'mode?type=none');
      console.log(`info: RemoveToolIntent:${response.data}`);
      this.ask('removing current tool');
    } catch (error) {
      console.log('error: RemoveToolIntent:try_catch');
      console.log(error);
      this.ask('Something went wrong, please try again later');
    }
  },

  async UndoIntent() {
    try {
      const response = await axios.get(ENDPOINT + 'action?type=undo');
      console.log(`info: UndoIntent:${response.data}`);
      this.ask('undo command received');
    } catch (error) {
      console.log('error: UndoIntent:try_catch');
      console.log(error);
      this.ask('Something went wrong, please try again later');
    }
  },

  async RedoIntent() {
    try {
      const response = await axios.get(ENDPOINT + 'action?type=redo');
      console.log(`info: RedoIntent:${response.data}`);
      this.ask('redo command received');
    } catch (error) {
      console.log('error: RedoIntent:try_catch');
      console.log(error);
      this.ask('Something went wrong, please try again later');
    }
  },

  async ClearIntent() {
    try {
      const response = await axios.get(ENDPOINT + 'action?type=clear');
      console.log(`info: ClearIntent:${response.data}`);
      this.ask('clear command received');
    } catch (error) {
      console.log('error: ClearIntent:try_catch');
      console.log(error);
      this.ask('Something went wrong, please try again later');
    }
  },

  async DrawIntent() {
    try {
      const shapeName = (this.$inputs.name.value as string).toUpperCase();
      const validShapes = [ 'RECTANGLE', 'OVAL', 'CIRCLE' ];
      if (!validShapes.includes(shapeName)) {
        console.log('error: DrawIntent:invalid_shape', shapeName);
        this.$speech.addText('Invalid shape, please choose from ');
        validShapes.forEach((element, index) => {
          if (index !== validShapes.length - 1) {
            this.$speech.addBreak('250ms');
          } else {
            this.$speech.addText(' and ');
          }
          this.$speech.addText(element.toLowerCase());
        });
        this.ask(this.$speech);
        return;
      }
      const response = await axios.get(
        ENDPOINT + `draw?type=shape&value=${shapeName}`
      );
      console.log(`info: DrawIntent:${response.data}`);
      this.ask('shape drawn');
    } catch (error) {
      console.log('error: DrawIntent:try_catch');
      console.log(error);
      this.ask('Something went wrong, please try again later');
    }
  },

  InitClassIntent() {
    this.followUpState('ClassState').ask(
      "Sure, name some classes, and say that's it when you are done"
    );
  },

  ClassState: {
    async AddClassIntent() {
      try {
        const className = this.$inputs.name.value as string;
        const response = await axios.get(
          ENDPOINT + `draw?type=class&value=${className}`
        );
        console.log(`info: ClassState:AddClassIntent:${response.data}`);
        this.ask('class added');
      } catch (error) {
        console.log('error: ClassState:AddClassIntent:try_catch');
        console.log(error);
        this.ask('Something went wrong, please try again later');
      }
    },
    EndClassIntent() {
      this.followUpState('').ask('Let me know if you need more classes.');
    },
  },

  async AddTextIntent() {
    try {
      const name = this.$inputs.name.value as string;
      const response = await axios.get(
        ENDPOINT + `draw?type=text&value=${name}`
      );
      console.log(`info: AddTextIntent:${response.data}`);
      this.ask('text added');
    } catch (error) {
      console.log('error: AddTextIntent:try_catch');
      console.log(error);
      this.ask('Something went wrong, please try again later');
    }
  },

  async ConnectClassIntent() {
    try {
      const name1 = this.$inputs.name1.value as string;
      const name2 = this.$inputs.name2.value as string;
      const response = await axios.get(
        ENDPOINT + `connect?a=${name1}&b=${name2}`
      );
      console.log(`info: ConnectClassIntent:${response.data}`);
      this.ask('command received');
    } catch (error) {
      console.log('error: ConnectClassIntent:try_catch');
      console.log(error);
      this.ask('Something went wrong, please try again later');
    }
  },

  Unhandled() {
    this.ask('I am not sure about what you said. Please try again!');
  },
});

export { app };
