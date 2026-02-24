import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Steps from "@/components/Steps";

const layout = ({children}: { children: React.ReactNode})=> {
    return <MaxWidthWrapper className={"flex-1 flex flex-col"}>
        <Steps />
        {children}</MaxWidthWrapper>
}

export default layout