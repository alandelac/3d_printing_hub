using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.Serialization;
using System.Text;

namespace _3DPrintingHub.Domain.Enums
{
    public enum MaterialSubType
    {
        Normal,
        [Description("Silk +")]
        [EnumMember(Value = "Silk +")]
        SilkPlus,
        Matte,
        [Description("Speedy +")]
        [EnumMember(Value = "Speedy +")]
        SpeedyPlus,
        Silk,
        CR
    }
}
