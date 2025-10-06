
declare module "vue-sonner";
declare module "@iconify/vue";
declare module "vue-sonner" {
  export interface SonnerProps {
    [key: string]: unknown
  }
}
declare module '@f3ve/vue-markdown-it' {
  import { defineComponent } from 'vue';
  export const VueMarkdownIt: ReturnType<typeof defineComponent>;
}
